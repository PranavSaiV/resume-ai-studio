import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const userId = req.headers['user-id'] as string;
  const { id } = req.query;
  if (!userId || !id || typeof id !== 'string') return res.status(401).end();

  const orig = await prisma.resume.findFirst({ where: { id, userId } });
  if (!orig) return res.status(404).end();

  const copy = await prisma.resume.create({
    data: {
      userId,
      title: `${orig.title} (Copy)`,
      content: orig.content ?? {},
      personalInfo: orig.personalInfo ?? {},
      experience: orig.experience ?? [],
      education: orig.education ?? [],
      skills: orig.skills ?? [],
    }
  });

  return res.status(200).json(copy);
}
