import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeResumeTextWithRetry } from '../../../lib/gemini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const { resumeData } = req.body;
  if (!resumeData) return res.status(400).json({ message: 'No resumeData provided' });

  try {
    const analysis = await analyzeResumeTextWithRetry(JSON.stringify(resumeData));
    res.status(200).json(analysis); // { atsScore, suggestions, skills }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to analyze text' });
  }
}
