import { getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { utcDateString } from '@/features/daily/logic/dailyText';
import { getDailyChallenge } from '@/features/daily/logic/dailyChallenge';

const bodySchema = z.object({
  textId: z.string(),
  wpm: z.number().int().min(0),
  accuracy: z.number().int().min(0).max(100),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  const { textId, wpm, accuracy } = parsed.data;

  const date = utcDateString(new Date());
  const challenge = await getDailyChallenge(date);

  // Anti-spoof: the submitted result must be for today's actual daily text.
  if (!challenge || challenge.id !== textId) {
    return res.status(409).json({ message: "Not today's challenge" });
  }

  const existing = await prisma.dailyResult.findUnique({
    where: { userId_date: { userId, date } },
  });

  // Keep only the user's best WPM for the day.
  if (existing && existing.wpm >= wpm) {
    return res.status(200).json({ best: existing.wpm, improved: false });
  }

  const result = await prisma.dailyResult.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, textId, wpm, accuracy },
    update: { wpm, accuracy, textId },
  });

  return res.status(200).json({ best: result.wpm, improved: true });
}
