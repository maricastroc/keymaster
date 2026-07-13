import type { Keystroke } from '@/types/keyStore';

/**
 * Per-key typing analysis, derived entirely from the keystroke stream that the
 * engine already records (`expectedChar` + `isCorrect` + `timestampMs`). No DB
 * schema or engine changes are needed — this is a pure transform, mirroring the
 * word heatmap in `../../heatmap/logic/history.ts`.
 */

/** Raw, additive aggregate for a single key. Safe to sum across rounds. */
export type KeyAgg = {
  presses: number; // times this key was the *expected* character
  errors: number; // times it was mistyped
  totalMs: number; // summed dwell time (ms) for the timed presses
  timed: number; // number of presses that contributed a dwell sample
};

/** A user's key profile: char (`a`–`z`) → aggregate. Serialized to localStorage. */
export type KeyProfile = Record<string, KeyAgg>;

/** A display-ready, derived view of one key. */
export type KeyStat = {
  key: string;
  presses: number;
  errors: number;
  accuracy: number; // 0–100
  avgMs: number; // avg dwell time; 0 when there were no timed samples
};

// Dwell samples above this are almost certainly pauses (tab-out, thinking,
// pause/resume) rather than the time it took to reach the key, so they'd skew
// the average. Cap mirrors the 300ms replay cap in spirit, but is looser since
// a single slow-but-real keypress can still exceed 300ms.
const MAX_DWELL_MS = 1000;

const isLetter = (ch: string) => /^[a-z]$/.test(ch);

/**
 * Fold a keystroke stream into a per-key aggregate. Only letter keys are
 * tracked; the "dwell" for a key is the time since the previous keystroke
 * (whatever it was), attributed to the key being reached.
 */
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

/** Sum two profiles key-by-key. Used to accumulate rounds over time. */
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

/** Derive display stats, sorted alphabetically for a stable keyboard render. */
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
  /** Ignore keys with too few samples to be meaningful. */
  minPresses?: number;
};

/**
 * Rank the keys most worth practicing. A key is "weak" when it's error-prone
 * or slow relative to the user's own other keys. Returns at most `limit`,
 * ranked worst-first. Returns `[]` when there isn't enough data to judge.
 */
export function selectWeakKeys(stats: KeyStat[], options: WeakKeyOptions = {}): KeyStat[] {
  const { limit = 5, minPresses = 3 } = options;

  const candidates = stats.filter((s) => s.presses >= minPresses);
  if (candidates.length === 0) return [];

  const timed = candidates.filter((s) => s.avgMs > 0).map((s) => s.avgMs);
  const maxMs = timed.length ? Math.max(...timed) : 0;
  const sortedMs = [...timed].sort((a, b) => a - b);
  const medianMs = sortedMs.length ? sortedMs[Math.floor(sortedMs.length / 2)] : 0;

  // Blend error rate (dominant) with relative slowness so a flawless-but-sluggish
  // key can still surface, without letting speed noise outrank real mistakes.
  const score = (s: KeyStat) => {
    const errorRate = s.errors / s.presses;
    const relSlow = maxMs > 0 ? s.avgMs / maxMs : 0;
    return 0.65 * errorRate + 0.35 * relSlow;
  };

  // A key only counts as weak if it actually misbehaves: has errors, or is
  // slower than the user's median. Otherwise a clean run would yield "weak"
  // keys that aren't.
  let weak = candidates.filter((s) => s.errors > 0 || (medianMs > 0 && s.avgMs > medianMs));

  // Flawless, even-paced run: fall back to the slowest keys so practice still
  // has something to target.
  if (weak.length === 0) {
    weak = [...candidates].sort((a, b) => b.avgMs - a.avgMs);
  } else {
    weak.sort((a, b) => score(b) - score(a));
  }

  return weak.slice(0, limit);
}
