import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['user-id'] as string;
  if (!userId) return res.status(401).end();

  if (req.method === 'GET') {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      select: { id: true, title: true, isActive: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json(resumes || []);
  }

  if (req.method === 'POST') {
    const { title } = req.body || {};
    const resume = await prisma.resume.create({
      data: { userId, title: title || 'Untitled Resume' }
    });
    return res.status(200).json(resume);
  }

  res.status(405).end();
}
