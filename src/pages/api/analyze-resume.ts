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
    const { jobDescription, resumeData } = req.body;
    if (!jobDescription || !resumeData) {
      return res.status(400).json({ message: 'Missing jobDescription or resumeData' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze the provided resume against the job description.
    Job Description: ${jobDescription}
    Resume Data: ${JSON.stringify(resumeData)}
    
    Return ONLY a valid JSON object with the exact following schema:
    {
      "atsScore": a number from 0 to 100,
      "summary": "a short text summarizing the fit",
      "extractedSkills": ["skill1", "skill2"],
      "missingKeywords": ["keyword1", "keyword2"],
      "suggestedRoles": ["role1", "role2"]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const analysis = JSON.parse(cleanText);
    res.status(200).json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to analyze resume' });
  }
}
