import { describe, it, expect } from 'vitest';
import { utcDateString, dailyIndex, formatDailyDate } from './dailyText';

describe('utcDateString', () => {
  it('returns the UTC calendar day', () => {
    expect(utcDateString(new Date('2026-07-14T23:59:59.000Z'))).toBe('2026-07-14');
    expect(utcDateString(new Date('2026-01-01T00:00:00.000Z'))).toBe('2026-01-01');
  });
});

describe('dailyIndex', () => {
  it('is deterministic for a given date', () => {
    expect(dailyIndex('2026-07-14', 100)).toBe(dailyIndex('2026-07-14', 100));
  });

  it('stays within range', () => {
    for (const date of ['2026-07-14', '2026-12-31', '2025-01-01', '2026-02-28']) {
      const idx = dailyIndex(date, 7);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(7);
    }
  });

  it('generally differs across consecutive days', () => {
    const days = ['2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18'];
    const indices = new Set(days.map((d) => dailyIndex(d, 50)));
    // Not a strict guarantee, but a good hash spreads 5 days over a pool of 50.
    expect(indices.size).toBeGreaterThan(1);
  });

  it('handles an empty pool without dividing by zero', () => {
    expect(dailyIndex('2026-07-14', 0)).toBe(0);
  });
});

describe('formatDailyDate', () => {
  it('formats without locale or timezone dependence', () => {
    expect(formatDailyDate('2026-07-14')).toBe('July 14, 2026');
    expect(formatDailyDate('2026-01-01')).toBe('January 1, 2026');
    expect(formatDailyDate('2025-12-31')).toBe('December 31, 2025');
  });

  it('falls back to the raw string on malformed input', () => {
    expect(formatDailyDate('nope')).toBe('nope');
  });
});
