import { describe, it, expect } from 'vitest';
import { calculateGeneralStats } from './calculateStats';
import type { Keystroke } from '@/types/keyStore';
import type { ChartPoint } from '@/types/chartPoint';

const k = (typedChar: string, isCorrect: boolean): Keystroke => ({
  charIndex: 0,
  expectedChar: isCorrect ? typedChar : 'a',
  typedChar,
  isCorrect,
  timestampMs: 1000,
});

const point = (wpm: number, raw: number): ChartPoint => ({
  second: 1,
  wpm,
  raw,
  accuracy: 100,
  burst: 0,
  errors: null,
  errorCount: 0,
});

describe('calculateGeneralStats', () => {
  it('returns zeroed stats when keystrokes are empty', () => {
    const result = calculateGeneralStats([], [], 0);
    expect(result).toEqual({
      wpm: 0,
      raw: 0,
      accuracy: 100,
      characters: { correct: 0, total: 0 },
      consistency: 0,
      time: 0,
      peakWPM: 0,
      peakRaw: 0,
    });
  });

  it('returns zeroed stats when chartData is empty', () => {
    const keystrokes = [k('a', true)];
    const result = calculateGeneralStats(keystrokes, [], 10);
    expect(result.wpm).toBe(0);
  });

  it('calculates accuracy correctly', () => {
    const keystrokes = [k('a', true), k('b', true), k('x', false), k('y', false)];
    const result = calculateGeneralStats(keystrokes, [point(60, 80)], 30);
    expect(result.accuracy).toBe(50);
    expect(result.characters).toEqual({ correct: 2, total: 4 });
  });

  it('ignores Backspace keystrokes in accuracy', () => {
    const keystrokes = [k('a', true), k('Backspace', false)];
    const result = calculateGeneralStats(keystrokes, [point(60, 60)], 10);
    expect(result.accuracy).toBe(100);
    expect(result.characters.total).toBe(1);
  });

  it('computes wpm and raw from keystrokes and total time', () => {
    const keystrokes = [
      ...Array.from({ length: 8 }, () => k('a', true)),
      ...Array.from({ length: 2 }, () => k('x', false)),
    ];
    const result = calculateGeneralStats(keystrokes, [point(40, 50), point(80, 90)], 30);
    expect(result.wpm).toBe(3);
    expect(result.raw).toBe(4);
  });

  it('calculates peakWPM and peakRaw correctly', () => {
    const chartData = [point(40, 50), point(100, 120), point(60, 70)];
    const result = calculateGeneralStats([k('a', true)], chartData, 10);
    expect(result.peakWPM).toBe(100);
    expect(result.peakRaw).toBe(120);
  });

  it('calculates consistency as 100 when wpm is constant', () => {
    const chartData = [point(60, 60), point(60, 60), point(60, 60)];
    const result = calculateGeneralStats([k('a', true)], chartData, 10);
    expect(result.consistency).toBe(100);
  });

  it('calculates lower consistency when wpm varies a lot', () => {
    const chartData = [point(10, 10), point(100, 100), point(10, 10)];
    const result = calculateGeneralStats([k('a', true)], chartData, 10);
    expect(result.consistency).toBeLessThan(60);
  });

  it('sets time from totalTimeSeconds', () => {
    const result = calculateGeneralStats([k('a', true)], [point(60, 60)], 42);
    expect(result.time).toBe(42);
  });

  it('consistency is 0 when only one wpm data point', () => {
    const result = calculateGeneralStats([k('a', true)], [point(60, 60)], 10);
    expect(result.consistency).toBe(0);
  });
});
