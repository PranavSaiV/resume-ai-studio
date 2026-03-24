import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
  const userId = req.headers['user-id'] as string;
  const { analysis } = req.body;
  
  if (!analysis) return res.status(400).json({ message: 'No analysis data provided' });

  try {
    const newResume = await prisma.resume.create({
      data: {
        userId,
        title: "Imported Document",
        content: analysis, 
        skills: analysis.skills || [],
        isActive: true
      }
    });

    res.status(200).json({ id: newResume.id, atsScore: analysis.atsScore, suggestions: analysis.suggestions });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to save resume' });
  }
}
