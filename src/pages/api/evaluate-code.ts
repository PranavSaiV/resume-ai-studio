import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error('Missing API Key');

const genAI = new GoogleGenerativeAI(apiKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { code, language, questionTitle, questionDescription, testCases } = req.body;
    if (!code || !questionTitle) {
      return res.status(400).json({ message: 'Missing required code or question parameters' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a code execution engine evaluating user code heuristically. 
    Question: ${questionTitle}
    Language: ${language || 'JavaScript'}
    Description: ${questionDescription}
    User Code:
    \`\`\`${language || 'javascript'}
    ${code}
    \`\`\`
    
    Evaluate the code based on ${language || 'JavaScript'}'s specific syntax.
    
    Test Cases to check (if any):
    ${JSON.stringify(testCases)}
    
    Return ONLY a valid JSON object with the following keys:
    "status": "Passed" or "Failed"
    "score": an integer out of 100 representing correctness and performance
    "feedback": a detailed string explaining logical errors or praising the solution
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const evaluation = JSON.parse(cleanText);
    res.status(200).json(evaluation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to evaluate code' });
  }
}
