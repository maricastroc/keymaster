import { describe, it, expect } from 'vitest';
import { calculateGeneralStats } from '@/utils/calculateStats';
import { buildChartData } from '@/utils/buildChartData';
import { calculateMetrics } from '../../logic/typing';
import { buildKeystrokes } from '../integration/helpers';
import type { Keystroke } from '@/types/keyStore';

describe('errors — accuracy degradation', () => {
  it('one error in 5 chars gives 80% accuracy', () => {
    const keystrokes = buildKeystrokes(['hello'], ['hXllo']);
    const result = calculateMetrics(keystrokes, 60);
    expect(result.accuracy).toBe(80);
  });

  it('all wrong gives 0% accuracy', () => {
    const keystrokes = buildKeystrokes(['abc'], ['xyz']);
    const result = calculateMetrics(keystrokes, 60);
    expect(result.accuracy).toBe(0);
  });

  it('accuracy rounds to nearest integer', () => {
    const keystrokes = buildKeystrokes(['abc'], ['abX']);
    const result = calculateMetrics(keystrokes, 60);
    expect(result.accuracy).toBe(67);
  });
});

describe('errors — wpm is based on correct chars only', () => {
  it('wpm counts only correct chars', () => {
    const keystrokes: Keystroke[] = [
      ...buildKeystrokes(['hello'], ['hello']),
      ...buildKeystrokes(['world'], ['XXXXX']).map((k) => ({
        ...k,
        timestampMs: k.timestampMs + 2000,
      })),
    ];
    const result = calculateMetrics(keystrokes, 60);
    expect(result.wpm).toBe(1);
  });
});

describe('errors — error count in chart data', () => {
  it('errors are counted per second bucket', () => {
    const keystrokes: Keystroke[] = [
      { charIndex: 0, expectedChar: 'h', typedChar: 'x', isCorrect: false, timestampMs: 500 },
      { charIndex: 1, expectedChar: 'e', typedChar: 'y', isCorrect: false, timestampMs: 600 },
    ];
    const chartData = buildChartData(keystrokes, 2);
    expect(chartData[0].errorCount).toBe(2);
  });

  it('errors in different seconds are bucketed separately', () => {
    const keystrokes: Keystroke[] = [
      { charIndex: 0, expectedChar: 'h', typedChar: 'x', isCorrect: false, timestampMs: 500 },
      { charIndex: 1, expectedChar: 'e', typedChar: 'y', isCorrect: false, timestampMs: 1500 },
    ];
    const chartData = buildChartData(keystrokes, 2);
    expect(chartData[0].errorCount).toBe(1);
    expect(chartData[1].errorCount).toBe(1);
  });
});

describe('skips — advancing with partial word', () => {
  it('skipping a word with partial input still counts typed chars in keystrokes', () => {

    const keystrokes = buildKeystrokes(['hello'], ['hel']);
    const result = calculateMetrics(keystrokes, 60);

    expect(result.accuracy).toBe(100);
  });

  it('calculateGeneralStats handles partial words gracefully', () => {
    const keystrokes = buildKeystrokes(['hello', 'world'], ['hel', 'wo']);
    const chartData = buildChartData(keystrokes, 10);
    const stats = calculateGeneralStats(keystrokes, chartData, 10);

    expect(stats.characters.total).toBe(5);
    expect(stats.characters.correct).toBe(5);
    expect(stats.accuracy).toBe(100);
  });
});
