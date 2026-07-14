import { describe, it, expect } from 'vitest';
import { calculateGeneralStats } from '@/utils/calculateStats';
import { buildChartData } from '@/utils/buildChartData';
import { calculateMetrics } from '../../logic/typing';
import type { Keystroke } from '@/types/keyStore';

describe('session validity — edge cases', () => {
  it('empty session returns safe defaults from calculateMetrics', () => {
    const result = calculateMetrics([], 30);
    expect(result.wpm).toBe(0);
    expect(result.accuracy).toBe(100);
  });

  it('empty session returns safe defaults from calculateGeneralStats', () => {
    const stats = calculateGeneralStats([], [], 0);
    expect(stats.wpm).toBe(0);
    expect(stats.raw).toBe(0);
    expect(stats.accuracy).toBe(100);
    expect(stats.peakWPM).toBe(0);
    expect(stats.peakRaw).toBe(0);
    expect(stats.consistency).toBe(0);
  });

  it('session with only backspaces returns safe defaults', () => {
    const keystrokes: Keystroke[] = [
      { charIndex: 0, expectedChar: 'h', typedChar: 'Backspace', isCorrect: false, timestampMs: 100 },
      { charIndex: 0, expectedChar: 'h', typedChar: 'Backspace', isCorrect: false, timestampMs: 200 },
    ];
    const result = calculateMetrics(keystrokes, 30);
    expect(result.wpm).toBe(0);
    expect(result.accuracy).toBe(100);
  });

  it('very short time does not cause division by zero', () => {
    const keystrokes: Keystroke[] = [
      { charIndex: 0, expectedChar: 'a', typedChar: 'a', isCorrect: true, timestampMs: 10 },
    ];

    const result = calculateMetrics(keystrokes, 0);
    expect(result.wpm).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.wpm)).toBe(true);
  });

  it('buildChartData with empty keystrokes returns empty array', () => {
    const data = buildChartData([], 0);
    expect(data).toEqual([]);
  });

  it('buildChartData pads seconds even when no keystrokes in that second', () => {
    const keystrokes: Keystroke[] = [
      { charIndex: 0, expectedChar: 'a', typedChar: 'a', isCorrect: true, timestampMs: 100 },
    ];
    const data = buildChartData(keystrokes, 5);
    expect(data).toHaveLength(5);
    expect(data[1].burst).toBe(0);
    expect(data[4].burst).toBe(0);
  });

  it('wpm never goes negative', () => {
    const keystrokes: Keystroke[] = [
      { charIndex: 0, expectedChar: 'a', typedChar: 'x', isCorrect: false, timestampMs: 500 },
    ];
    const data = buildChartData(keystrokes, 3);
    expect(data.every((p) => p.wpm >= 0)).toBe(true);
  });

  it('accuracy never exceeds 100', () => {
    const keystrokes: Keystroke[] = [
      { charIndex: 0, expectedChar: 'a', typedChar: 'a', isCorrect: true, timestampMs: 100 },
      { charIndex: 1, expectedChar: 'b', typedChar: 'b', isCorrect: true, timestampMs: 200 },
    ];
    const data = buildChartData(keystrokes, 2);
    expect(data.every((p) => p.accuracy <= 100)).toBe(true);
  });

  it('session with single char has valid stats', () => {
    const keystrokes: Keystroke[] = [
      { charIndex: 0, expectedChar: 'a', typedChar: 'a', isCorrect: true, timestampMs: 500 },
    ];
    const chartData = buildChartData(keystrokes, 1);
    const stats = calculateGeneralStats(keystrokes, chartData, 1);

    expect(stats.characters.correct).toBe(1);
    expect(stats.characters.total).toBe(1);
    expect(stats.accuracy).toBe(100);
    expect(stats.wpm).toBeGreaterThanOrEqual(0);
  });
});
