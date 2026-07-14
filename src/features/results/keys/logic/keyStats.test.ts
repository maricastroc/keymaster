import { describe, it, expect } from 'vitest';
import {
  analyzeKeys,
  mergeProfiles,
  profileToStats,
  selectWeakKeys,
  type KeyProfile,
  type KeyStat,
} from './keyStats';
import type { Keystroke } from '@/types/keyStore';

function ks(
  expectedChar: string,
  typedChar: string,
  timestampMs: number,
): Keystroke {
  return {
    charIndex: 0,
    expectedChar,
    typedChar,
    isCorrect: expectedChar === typedChar,
    timestampMs,
  };
}

describe('analyzeKeys', () => {
  it('returns an empty profile for no keystrokes', () => {
    expect(analyzeKeys([])).toEqual({});
  });

  it('counts presses and errors per expected key', () => {
    const profile = analyzeKeys([
      ks('a', 'a', 100),
      ks('a', 's', 200),
      ks('b', 'b', 300),
    ]);
    expect(profile.a.presses).toBe(2);
    expect(profile.a.errors).toBe(1);
    expect(profile.b.presses).toBe(1);
    expect(profile.b.errors).toBe(0);
  });

  it('lowercases the expected key so case is a per-key error, not a new key', () => {
    const profile = analyzeKeys([ks('A', 'a', 100)]);
    expect(Object.keys(profile)).toEqual(['a']);
    expect(profile.a.errors).toBe(1);
  });

  it('ignores non-letter expected chars (extras, punctuation, spaces)', () => {
    const profile = analyzeKeys([
      ks('a', 'a', 100),
      ks('', 'x', 200),
      ks('1', '1', 300),
    ]);
    expect(Object.keys(profile)).toEqual(['a']);
  });

  it('measures dwell as the gap from the previous keystroke, capped', () => {
    const profile = analyzeKeys([
      ks('a', 'a', 0),
      ks('b', 'b', 150),
      ks('c', 'c', 5000),
    ]);
    expect(profileToStats(profile).find((s) => s.key === 'b')?.avgMs).toBe(150);

    expect(profileToStats(profile).find((s) => s.key === 'c')?.avgMs).toBe(0);
  });

  it('drops Backspace pseudo-keystrokes defensively', () => {
    const profile = analyzeKeys([ks('a', 'a', 100), ks('a', 'Backspace', 150)]);
    expect(profile.a.presses).toBe(1);
  });
});

describe('mergeProfiles', () => {
  it('sums aggregates key-by-key across rounds', () => {
    const a: KeyProfile = { e: { presses: 3, errors: 1, totalMs: 300, timed: 3 } };
    const b: KeyProfile = {
      e: { presses: 2, errors: 0, totalMs: 100, timed: 1 },
      t: { presses: 4, errors: 2, totalMs: 400, timed: 4 },
    };
    const merged = mergeProfiles(a, b);
    expect(merged.e).toEqual({ presses: 5, errors: 1, totalMs: 400, timed: 4 });
    expect(merged.t).toEqual({ presses: 4, errors: 2, totalMs: 400, timed: 4 });
  });
});

describe('profileToStats', () => {
  it('derives accuracy and avg dwell, sorted alphabetically', () => {
    const stats = profileToStats({
      b: { presses: 4, errors: 1, totalMs: 800, timed: 4 },
      a: { presses: 2, errors: 0, totalMs: 200, timed: 2 },
    });
    expect(stats.map((s) => s.key)).toEqual(['a', 'b']);
    expect(stats[0]).toMatchObject({ key: 'a', accuracy: 100, avgMs: 100 });
    expect(stats[1]).toMatchObject({ key: 'b', accuracy: 75, avgMs: 200 });
  });
});

describe('selectWeakKeys', () => {
  const stat = (key: string, presses: number, errors: number, avgMs: number): KeyStat => ({
    key,
    presses,
    errors,
    accuracy: Math.round(((presses - errors) / presses) * 100),
    avgMs,
  });

  it('returns nothing without enough samples', () => {
    expect(selectWeakKeys([stat('a', 1, 0, 100)], { minPresses: 3 })).toEqual([]);
  });

  it('ranks error-prone keys ahead of clean ones', () => {
    const weak = selectWeakKeys([
      stat('a', 10, 0, 100),
      stat('b', 10, 5, 120),
      stat('c', 10, 1, 110),
    ]);
    expect(weak[0].key).toBe('b');
    expect(weak.map((s) => s.key)).not.toContain('a');
  });

  it('respects the limit', () => {
    const stats = ['a', 'b', 'c', 'd'].map((k) => stat(k, 10, 5, 200));
    expect(selectWeakKeys(stats, { limit: 2 })).toHaveLength(2);
  });

  it('falls back to slowest keys on a flawless, timed run', () => {
    const weak = selectWeakKeys([
      stat('a', 10, 0, 90),
      stat('b', 10, 0, 90),
      stat('c', 10, 0, 300),
    ]);
    expect(weak[0].key).toBe('c');
  });
});
