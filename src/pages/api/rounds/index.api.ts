import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const roundSchema = z.object({
  wpm: z.number().int().min(0),
  accuracy: z.number().int().min(0).max(100),
  time: z.number().min(0),
  mode: z.enum(['timed', 'passage']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const userId = session.user.id;

  if (req.method === 'GET') {
    const rounds = await prisma.round.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.status(200).json(rounds);
  }

  if (req.method === 'POST') {
    const parsed = roundSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid round data' });
    }

    // Idempotency guard: a rapid double-submit (double-click, retry, or a
    // duplicated client call) with identical stats returns the existing row
    // instead of creating a duplicate.
    const recentDuplicate = await prisma.round.findFirst({
      where: {
        userId,
        ...parsed.data,
        createdAt: { gte: new Date(Date.now() - 5000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentDuplicate) {
      return res.status(200).json(recentDuplicate);
    }

    const round = await prisma.round.create({
      data: { userId, ...parsed.data },
    });

    return res.status(201).json(round);
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
