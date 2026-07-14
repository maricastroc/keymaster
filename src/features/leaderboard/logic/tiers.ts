export type RankTier = 'gold' | 'silver' | 'bronze' | null;

/** Podium tier for a 1-indexed rank: 1→gold, 2→silver, 3→bronze, else none. */
export function rankTier(rank: number): RankTier {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return null;
}

export const TIER_COLOR: Record<Exclude<RankTier, null>, string> = {
  gold: 'var(--color-yellow-500)',
  silver: 'var(--color-neutral-300)',
  bronze: 'var(--color-orange-500)',
};
