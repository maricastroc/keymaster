import { describe, it, expect } from 'vitest';
import { buildChartData } from './buildChartData';

const k = (typedChar: string, isCorrect: boolean, timestampMs: number) => ({
  charIndex: 0,
  expectedChar: isCorrect ? typedChar : 'a',
  typedChar,
  isCorrect,
  timestampMs,
});

describe('buildChartData', () => {
  it('returns empty array for empty keystrokes', () => {
    expect(buildChartData([], 0)).toEqual([]);
  });

  it('groups keystrokes by second', () => {
    const keystrokes = [k('a', true, 500), k('b', true, 1500)];
    const data = buildChartData(keystrokes, 2);
    expect(data).toHaveLength(2);
    expect(data[0].second).toBe(1);
    expect(data[1].second).toBe(2);
  });

  it('wpm is 0 when no correct keystrokes', () => {
    const keystrokes = [k('x', false, 500)];
    const data = buildChartData(keystrokes, 1);
    expect(data[0].wpm).toBe(0);
  });

  it('ignores Backspace in wpm and raw calculation', () => {
    const keystrokes = [k('a', true, 500), k('Backspace', false, 600)];
    const data = buildChartData(keystrokes, 1);
    expect(data[0].raw).toBe(12);
    expect(data[0].wpm).toBe(12);
  });

  it('counts errors correctly', () => {
    const keystrokes = [k('a', true, 500), k('x', false, 600)];
    const data = buildChartData(keystrokes, 1);
    expect(data[0].errorCount).toBe(1);
  });

  it('pads seconds up to durationSec', () => {
    const keystrokes = [k('a', true, 500)];
    const data = buildChartData(keystrokes, 3);
    expect(data).toHaveLength(3);
  });
});
