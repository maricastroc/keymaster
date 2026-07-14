import { describe, it, expect } from 'vitest';
import { aggregateStats } from './aggregateStats';
import type { RoundStats } from '@/types/roundStats';

const r = (over: Partial<RoundStats>): RoundStats => ({
  id: Math.random().toString(36).slice(2),
  timestamp: 0,
  mode: 'timed',
  difficulty: 'easy',
  wpm: 50,
  accuracy: 100,
  time: 30,
  ...over,
});

describe('aggregateStats', () => {
  it('returns zeroed stats for no rounds', () => {
    const s = aggregateStats([]);
    expect(s.totalRounds).toBe(0);
    expect(s.avgWpm).toBe(0);
    expect(s.bestWpm).toBe(0);
    expect(s.trend).toEqual([]);
  });

  it('computes overall averages and best', () => {
    const s = aggregateStats([
      r({ wpm: 40, accuracy: 90, time: 30 }),
      r({ wpm: 60, accuracy: 100, time: 30 }),
    ]);
    expect(s.totalRounds).toBe(2);
    expect(s.avgWpm).toBe(50);
    expect(s.bestWpm).toBe(60);
    expect(s.avgAccuracy).toBe(95);
    expect(s.totalTimeSec).toBe(60);
  });

  it('buckets by mode and difficulty', () => {
    const s = aggregateStats([
      r({ mode: 'timed', difficulty: 'easy', wpm: 50 }),
      r({ mode: 'passage', difficulty: 'hard', wpm: 70 }),
    ]);
    expect(s.byMode.timed.count).toBe(1);
    expect(s.byMode.timed.avgWpm).toBe(50);
    expect(s.byMode.passage.bestWpm).toBe(70);
    expect(s.byDifficulty.hard.count).toBe(1);
    expect(s.byDifficulty.medium.count).toBe(0);
  });

  it('reports full consistency for identical WPM and lower for varied WPM', () => {
    const steady = aggregateStats([r({ wpm: 50 }), r({ wpm: 50 }), r({ wpm: 50 })]);
    expect(steady.consistency).toBe(100);

    const varied = aggregateStats([r({ wpm: 10 }), r({ wpm: 90 }), r({ wpm: 10 })]);
    expect(varied.consistency).toBeLessThan(50);

    expect(aggregateStats([r({ wpm: 50 })]).consistency).toBe(0);
  });

  it('orders the trend oldest → newest regardless of input order', () => {
    const s = aggregateStats([
      r({ timestamp: 300, wpm: 3 }),
      r({ timestamp: 100, wpm: 1 }),
      r({ timestamp: 200, wpm: 2 }),
    ]);
    expect(s.trend.map((p) => p.wpm)).toEqual([1, 2, 3]);
    expect(s.trend.map((p) => p.index)).toEqual([1, 2, 3]);
  });
});
