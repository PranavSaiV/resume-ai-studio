import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['user-id'] as string;
  const { id } = req.query;
  if (!userId || !id || typeof id !== 'string') return res.status(401).end();

  if (req.method === 'GET') {
    const resume = await prisma.resume.findFirst({ where: { id, userId } });
    if (!resume) return res.status(404).end();
    return res.status(200).json(resume);
  }

  if (req.method === 'PUT') {
    const { title, personalInfo, experience, education, skills, isActive } = req.body;
    const resume = await prisma.resume.updateMany({
      where: { id, userId },
      data: { 
        title, 
        personalInfo: personalInfo || {}, 
        experience: experience || [], 
        education: education || [], 
        skills: skills || [],
        isActive: isActive !== undefined ? isActive : true
      }
    });
    return res.status(200).json(resume);
  }

  if (req.method === 'DELETE') {
    await prisma.resume.deleteMany({ where: { id, userId } });
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
