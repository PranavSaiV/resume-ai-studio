import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password, name } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const user = await prisma.user.create({
      data: { email, password, name },
    });
    return res.status(200).json({ userId: user.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
