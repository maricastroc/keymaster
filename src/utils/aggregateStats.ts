import { RoundStats } from '@/types/roundStats';

export type BucketStats = {
  count: number;
  avgWpm: number;
  bestWpm: number;
  avgAccuracy: number;
};

export type TrendPoint = {
  index: number;
  wpm: number;
  accuracy: number;
  timestamp: number;
};

export type AggregatedStats = {
  totalRounds: number;
  avgWpm: number;
  bestWpm: number;
  avgAccuracy: number;
  consistency: number;
  totalTimeSec: number;
  byMode: Record<RoundStats['mode'], BucketStats>;
  byDifficulty: Record<RoundStats['difficulty'], BucketStats>;
  trend: TrendPoint[];
};

/**
 * How steady WPM is across rounds: 100 minus the coefficient of variation,
 * clamped to 0–100. Needs at least 2 rounds to mean anything.
 */
function consistencyOf(wpms: number[]): number {
  if (wpms.length < 2) return 0;
  const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
  if (mean === 0) return 0;
  const variance = wpms.reduce((a, b) => a + (b - mean) ** 2, 0) / wpms.length;
  const cv = (Math.sqrt(variance) / mean) * 100;
  return Math.max(0, Math.min(100, Math.round(100 - cv)));
}

function bucketize(rounds: RoundStats[]): BucketStats {
  if (rounds.length === 0) {
    return { count: 0, avgWpm: 0, bestWpm: 0, avgAccuracy: 0 };
  }
  const count = rounds.length;
  return {
    count,
    avgWpm: Math.round(rounds.reduce((s, r) => s + r.wpm, 0) / count),
    bestWpm: Math.max(...rounds.map((r) => r.wpm)),
    avgAccuracy: Math.round(rounds.reduce((s, r) => s + r.accuracy, 0) / count),
  };
}

export function aggregateStats(rounds: RoundStats[]): AggregatedStats {
  const overall = bucketize(rounds);

  const trend = [...rounds]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r, i) => ({
      index: i + 1,
      wpm: r.wpm,
      accuracy: r.accuracy,
      timestamp: r.timestamp,
    }));

  return {
    totalRounds: rounds.length,
    avgWpm: overall.avgWpm,
    bestWpm: overall.bestWpm,
    avgAccuracy: overall.avgAccuracy,
    consistency: consistencyOf(rounds.map((r) => r.wpm)),
    totalTimeSec: Math.round(rounds.reduce((s, r) => s + r.time, 0)),
    byMode: {
      timed: bucketize(rounds.filter((r) => r.mode === 'timed')),
      passage: bucketize(rounds.filter((r) => r.mode === 'passage')),
    },
    byDifficulty: {
      easy: bucketize(rounds.filter((r) => r.difficulty === 'easy')),
      medium: bucketize(rounds.filter((r) => r.difficulty === 'medium')),
      hard: bucketize(rounds.filter((r) => r.difficulty === 'hard')),
    },
    trend,
  };
}
