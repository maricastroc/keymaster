import type { Keystroke } from '@/types/keyStore';

export type KeyAgg = {
  presses: number;
  errors: number;
  totalMs: number;
  timed: number;
};

export type KeyProfile = Record<string, KeyAgg>;

export type KeyStat = {
  key: string;
  presses: number;
  errors: number;
  accuracy: number;
  avgMs: number;
};

const MAX_DWELL_MS = 1000;

const isLetter = (ch: string) => /^[a-z]$/.test(ch);

export function analyzeKeys(keystrokes: Keystroke[]): KeyProfile {
  if (!keystrokes || keystrokes.length === 0) return {};

  const sorted = [...keystrokes]
    .filter((k) => k.typedChar !== 'Backspace')
    .sort((a, b) => a.timestampMs - b.timestampMs);

  const profile: KeyProfile = {};
  let prevMs: number | null = null;

  for (const k of sorted) {
    const dwell = prevMs === null ? null : k.timestampMs - prevMs;
    prevMs = k.timestampMs;

    const key = (k.expectedChar || '').toLowerCase();
    if (!isLetter(key)) continue;

    const agg = profile[key] ?? { presses: 0, errors: 0, totalMs: 0, timed: 0 };
    agg.presses += 1;
    if (!k.isCorrect) agg.errors += 1;
    if (dwell !== null && dwell > 0 && dwell <= MAX_DWELL_MS) {
      agg.totalMs += dwell;
      agg.timed += 1;
    }
    profile[key] = agg;
  }

  return profile;
}

export function mergeProfiles(a: KeyProfile, b: KeyProfile): KeyProfile {
  const out: KeyProfile = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[key] ?? { presses: 0, errors: 0, totalMs: 0, timed: 0 };
    const y = b[key] ?? { presses: 0, errors: 0, totalMs: 0, timed: 0 };
    out[key] = {
      presses: x.presses + y.presses,
      errors: x.errors + y.errors,
      totalMs: x.totalMs + y.totalMs,
      timed: x.timed + y.timed,
    };
  }
  return out;
}

export function profileToStats(profile: KeyProfile): KeyStat[] {
  return Object.entries(profile)
    .map(([key, agg]) => ({
      key,
      presses: agg.presses,
      errors: agg.errors,
      accuracy: agg.presses > 0 ? Math.round(((agg.presses - agg.errors) / agg.presses) * 100) : 100,
      avgMs: agg.timed > 0 ? Math.round(agg.totalMs / agg.timed) : 0,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export type WeakKeyOptions = {
  limit?: number;
  minPresses?: number;
};

export function selectWeakKeys(stats: KeyStat[], options: WeakKeyOptions = {}): KeyStat[] {
  const { limit = 5, minPresses = 3 } = options;

  const candidates = stats.filter((s) => s.presses >= minPresses);
  if (candidates.length === 0) return [];

  const timed = candidates.filter((s) => s.avgMs > 0).map((s) => s.avgMs);
  const maxMs = timed.length ? Math.max(...timed) : 0;
  const sortedMs = [...timed].sort((a, b) => a - b);
  const medianMs = sortedMs.length ? sortedMs[Math.floor(sortedMs.length / 2)] : 0;

  const score = (s: KeyStat) => {
    const errorRate = s.errors / s.presses;
    const relSlow = maxMs > 0 ? s.avgMs / maxMs : 0;
    return 0.65 * errorRate + 0.35 * relSlow;
  };

  let weak = candidates.filter((s) => s.errors > 0 || (medianMs > 0 && s.avgMs > medianMs));

  if (weak.length === 0) {
    weak = [...candidates].sort((a, b) => b.avgMs - a.avgMs);
  } else {
    weak.sort((a, b) => score(b) - score(a));
  }

  return weak.slice(0, limit);
}
