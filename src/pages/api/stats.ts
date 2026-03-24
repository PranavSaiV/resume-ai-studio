import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const userId = req.headers['user-id'] as string;
  if (!userId) return res.status(401).end();

  try {
    const resumeCount = await prisma.resume.count({ where: { userId } });
    const activeResumes = await prisma.resume.count({ where: { userId, isActive: true } });
    
    const userStats = await prisma.userStats.aggregate({
      where: { userId },
      _avg: { accuracy: true }
    });
    let accuracy = userStats._avg.accuracy ? Math.round(userStats._avg.accuracy) : 0;
    
    // Let's also grab ATS Score from the latest resume
    const latestResume = await prisma.resume.findFirst({
       where: { userId },
       orderBy: { updatedAt: 'desc' },
       select: { content: true }
    });
    
    let dbAtsScore = 0;
    if (latestResume && typeof latestResume.content === 'object' && latestResume.content !== null) {
      if ('atsScore' in (latestResume.content as any)) {
         dbAtsScore = (latestResume.content as any).atsScore;
      }
    }

    res.status(200).json({
      totalResumes: resumeCount,
      activeResumes,
      quizAccuracy: accuracy,
      latestAtsScore: dbAtsScore || 0
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load stats" });
  }
}
