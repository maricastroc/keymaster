import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import type { LeaderboardEntry, LeaderboardResponse } from '@/types/leaderboard';

const querySchema = z.object({
  period: z.enum(['all', 'week']).default('all'),
});

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const LIMIT = 50;

// One row per user: their single best round in the period, with display fields.
type RawRow = {
  userId: string;
  wpm: number;
  accuracy: number;
  mode: string;
  difficulty: string;
  createdAt: Date;
  name: string | null;
  image: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid query' });
  }
  const { period } = parsed.data;

  // Anyone can view the board; the signed-in user's own row is highlighted and
  // pinned even when they're outside the top 50.
  const session = await getServerSession(req, res, authOptions);
  const meId = session?.user?.id ?? null;

  const since = period === 'week' ? new Date(Date.now() - WEEK_MS) : null;
  const sinceFilter = since ? Prisma.sql`WHERE r."createdAt" >= ${since}` : Prisma.empty;

  try {
    // DISTINCT ON keeps each user's best round (ties broken by who reached it
    // first), then we order those bests to build the ranking.
    const rows = await prisma.$queryRaw<RawRow[]>(Prisma.sql`
      SELECT best."userId", best.wpm, best.accuracy, best.mode, best.difficulty,
             best."createdAt", best.name, best.image
      FROM (
        SELECT DISTINCT ON (r."userId")
          r."userId", r.wpm, r.accuracy, r.mode, r.difficulty, r."createdAt",
          u.name, u.image
        FROM "Round" r
        JOIN "User" u ON u.id = r."userId"
        ${sinceFilter}
        ORDER BY r."userId", r.wpm DESC, r."createdAt" ASC
      ) best
      ORDER BY best.wpm DESC, best."createdAt" ASC
      LIMIT ${LIMIT}
    `);

    const entries: LeaderboardEntry[] = rows.map((row, i) => ({
      rank: i + 1,
      userId: row.userId,
      name: row.name,
      image: row.image,
      wpm: row.wpm,
      accuracy: row.accuracy,
      mode: row.mode,
      difficulty: row.difficulty,
      createdAt: row.createdAt.toISOString(),
      isMe: row.userId === meId,
    }));

    let me: LeaderboardEntry | null = entries.find((e) => e.isMe) ?? null;

    // If signed in but outside the top LIMIT, compute the true rank separately.
    if (meId && !me) {
      const agg = await prisma.round.aggregate({
        where: { userId: meId, ...(since ? { createdAt: { gte: since } } : {}) },
        _max: { wpm: true },
      });
      const myBest = agg._max.wpm;

      if (myBest != null) {
        const higher = await prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
          SELECT COUNT(*)::int AS count FROM (
            SELECT r."userId"
            FROM "Round" r
            ${sinceFilter}
            GROUP BY r."userId"
            HAVING MAX(r.wpm) > ${myBest}
          ) x
        `);

        const myRound = await prisma.round.findFirst({
          where: { userId: meId, wpm: myBest, ...(since ? { createdAt: { gte: since } } : {}) },
          orderBy: { createdAt: 'asc' },
        });

        me = {
          rank: Number(higher[0]?.count ?? 0) + 1,
          userId: meId,
          name: session?.user?.name ?? null,
          image: session?.user?.image ?? null,
          wpm: myBest,
          accuracy: myRound?.accuracy ?? 0,
          mode: myRound?.mode ?? 'timed',
          difficulty: myRound?.difficulty ?? 'easy',
          createdAt: (myRound?.createdAt ?? new Date()).toISOString(),
          isMe: true,
        };
      }
    }

    const payload: LeaderboardResponse = { period, entries, me };
    return res.status(200).json(payload);
  } catch {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
