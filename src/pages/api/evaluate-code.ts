import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error('Missing API Key');
const openai = new OpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { code, language, questionTitle, questionDescription, testCases } = req.body;
    if (!code || !questionTitle) {
      return res.status(400).json({ message: 'Missing required code or question parameters' });
    }

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

    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      response_format: { type: "json_object" }
    });
    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Safely extract JSON block
    const match = responseText.match(/\{[\s\S]*\}/);
    const cleanText = match ? match[0] : "{}";

    const evaluation = JSON.parse(cleanText);
    res.status(200).json(evaluation);
  } catch (error: any) {
    console.error("Evaluate Code Error:", error);
    res.status(500).json({ message: error.message || 'Failed to evaluate code' });
  }
}
