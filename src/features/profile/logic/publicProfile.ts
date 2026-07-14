import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { aggregateStats, type AggregatedStats } from '@/utils/aggregateStats';
import type { RoundStats } from '@/types/roundStats';

export type PublicProfile = {
  id: string;
  name: string | null;
  image: string | null;
  /** ISO string — safe to pass through getServerSideProps JSON. */
  memberSince: string;
};

export type PublicProfileData = {
  profile: PublicProfile;
  stats: AggregatedStats;
  /** All-time rank by best WPM, or null when the user has no rounds. */
  rank: number | null;
};

/**
 * Server-only. Assembles a user's public profile from the database: their
 * public identity (never email), aggregate round stats, and their all-time
 * leaderboard rank. Returns null when the user doesn't exist.
 *
 * Everything surfaced here is already public via the leaderboard (name, image,
 * best WPM keyed by userId), so no new identity is exposed.
 */
export async function getPublicProfile(userId: string): Promise<PublicProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, image: true, createdAt: true },
  });
  if (!user) return null;

  const rounds = await prisma.round.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      wpm: true,
      accuracy: true,
      time: true,
      mode: true,
      difficulty: true,
      createdAt: true,
    },
  });

  const roundStats: RoundStats[] = rounds.map((r) => ({
    id: r.id,
    timestamp: r.createdAt.getTime(),
    wpm: r.wpm,
    accuracy: r.accuracy,
    time: r.time,
    mode: r.mode as RoundStats['mode'],
    difficulty: r.difficulty as RoundStats['difficulty'],
  }));

  const stats = aggregateStats(roundStats);

  let rank: number | null = null;
  if (stats.bestWpm > 0) {
    const higher = await prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
      SELECT COUNT(*)::int AS count FROM (
        SELECT r."userId"
        FROM "Round" r
        GROUP BY r."userId"
        HAVING MAX(r.wpm) > ${stats.bestWpm}
      ) x
    `);
    rank = Number(higher[0]?.count ?? 0) + 1;
  }

  return {
    profile: {
      id: user.id,
      name: user.name,
      image: user.image,
      memberSince: user.createdAt.toISOString(),
    },
    stats,
    rank,
  };
}
