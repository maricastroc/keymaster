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
  totalTimeSec: number;
  byMode: Record<RoundStats['mode'], BucketStats>;
  byDifficulty: Record<RoundStats['difficulty'], BucketStats>;
  trend: TrendPoint[];
};

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

  // Oldest → newest so the trend chart reads left-to-right as progress.
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
