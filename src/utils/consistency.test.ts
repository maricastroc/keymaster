import { describe, it, expect } from 'vitest';
import { coefficientOfVariation, consistencyScore } from './consistency';

describe('coefficientOfVariation', () => {
  it('is 0 for a constant series', () => {
    expect(coefficientOfVariation([50, 50, 50])).toBe(0);
  });

  it('grows as the spread grows', () => {
    const tight = coefficientOfVariation([48, 50, 52]);
    const loose = coefficientOfVariation([10, 50, 90]);
    expect(loose).toBeGreaterThan(tight);
  });

  it('returns 0 with fewer than two samples or a non-positive mean', () => {
    expect(coefficientOfVariation([])).toBe(0);
    expect(coefficientOfVariation([42])).toBe(0);
    expect(coefficientOfVariation([0, 0, 0])).toBe(0);
  });
});

describe('consistencyScore', () => {
  it('is 100 when every second is the same pace', () => {
    expect(consistencyScore([60, 60, 60, 60])).toBe(100);
  });

  it('is high for a steady pace', () => {
    expect(consistencyScore([58, 60, 62, 59, 61])).toBeGreaterThan(90);
  });

  it('is low for an erratic pace', () => {
    expect(consistencyScore([10, 100, 10, 100])).toBeLessThan(40);
  });

  it('rewards steadier typing with a higher score', () => {
    const steady = consistencyScore([55, 60, 58, 62]);
    const erratic = consistencyScore([20, 90, 30, 80]);
    expect(steady).toBeGreaterThan(erratic);
  });

  it('stays within 0–100', () => {
    const score = consistencyScore([1, 200, 1, 200, 1]);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns 0 for runs too short to judge', () => {
    expect(consistencyScore([])).toBe(0);
    expect(consistencyScore([75])).toBe(0);
  });
});
