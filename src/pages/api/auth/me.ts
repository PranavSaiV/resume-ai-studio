import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['user-id'] as string;
  if (!userId) return res.status(401).end();

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).end();
    return res.status(200).json({ email: user.email, name: user.name });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
