import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error('Missing API Key');
const groq = new Groq({ apiKey });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { jobDescription, resumeData } = req.body;
    if (!jobDescription || !resumeData) {
      return res.status(400).json({ message: 'Missing jobDescription or resumeData' });
    }

    const prompt = `Analyze the provided resume against the job description.
    Job Description: ${jobDescription}
    Resume Data: ${JSON.stringify(resumeData)}
    
    You MUST respond with a valid JSON object. Do not include markdown formatting or extra text.
    The JSON object must have EXACTLY this schema:
    {
      "atsScore": 85,
      "suggestions": ["Improve action verbs", "Add metrics to experience"],
      "skills": ["React", "TypeScript", "Node.js"]
    }`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(responseText);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to analyze resume' });
  }
}
