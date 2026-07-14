import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { dailyIndex } from './dailyText';
import type { DailyChallengeText, DailyEntry } from '@/types/daily';

const DAILY_LANGUAGE = 'en';

export async function getDailyChallenge(dateStr: string): Promise<DailyChallengeText | null> {
  let where: Prisma.TextWhereInput = { language: DAILY_LANGUAGE };
  let count = await prisma.text.count({ where });

  if (count === 0) {
    where = {};
    count = await prisma.text.count({ where });
  }
  if (count === 0) return null;

  const index = dailyIndex(dateStr, count);
  const text = await prisma.text.findFirst({
    where,
    orderBy: { id: 'asc' },
    skip: index,
  });
  if (!text) return null;

  return { id: text.id, content: text.content };
}

/**
 * Server-only. Top results on `dateStr`, ranked by best WPM. `meId` flags the
 * viewer's own row.
 */
export async function getDailyLeaderboard(
  dateStr: string,
  meId: string | null
): Promise<DailyEntry[]> {
  const rows = await prisma.dailyResult.findMany({
    where: { date: dateStr },
    orderBy: [{ wpm: 'desc' }, { createdAt: 'asc' }],
    take: 50,
    select: {
      userId: true,
      wpm: true,
      accuracy: true,
      createdAt: true,
      user: { select: { name: true, image: true } },
    },
  });

  return rows.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    name: r.user.name,
    image: r.user.image,
    wpm: r.wpm,
    accuracy: r.accuracy,
    createdAt: r.createdAt.toISOString(),
    isMe: r.userId === meId,
  }));
}
