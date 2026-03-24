import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeResumeTextWithRetry } from '../../../lib/gemini';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const userId = req.headers['user-id'] as string;
  const { text } = req.body;
  
  if (!text) return res.status(400).json({ message: 'No text provided' });

  try {
    const analysis = await analyzeResumeTextWithRetry(text);
    res.status(200).json(analysis);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to analyze text' });
  }
}
