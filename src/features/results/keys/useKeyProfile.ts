import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Keystroke } from '@/types/keyStore';
import {
  analyzeKeys,
  mergeProfiles,
  profileToStats,
  selectWeakKeys,
  type KeyProfile,
  type KeyStat,
} from './logic/keyStats';

const STORAGE_KEY = 'stats:keyProfile';

/**
 * Accumulates a per-key profile across rounds in localStorage (so it works for
 * anonymous users too, like the rest of the app's client state). This is what
 * turns a single noisy round into a reliable "weak keys over time" signal.
 *
 * Persisting raw keystrokes to the DB was deliberately avoided — a profile is a
 * few dozen small integers, whereas keystrokes are thousands of rows per round.
 */
export function useKeyProfile() {
  const [profile, setProfile] = useLocalStorage<KeyProfile>(STORAGE_KEY, {});

  // Mirror the stored value in a ref so `recordRound` can read the latest
  // profile without being re-created on every change (the ResultSection mount
  // effect captures it once).
  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Guards against double-recording the same round (React StrictMode double
  // mounts, or an accidental remount). A round is identified by its keystroke
  // count plus first/last timestamps.
  const lastSig = useRef<string | null>(null);

  const recordRound = useCallback(
    (keystrokes: Keystroke[]) => {
      if (!keystrokes || keystrokes.length === 0) return;
      const sig = `${keystrokes.length}:${keystrokes[0].timestampMs}:${keystrokes[keystrokes.length - 1].timestampMs}`;
      if (lastSig.current === sig) return;
      lastSig.current = sig;

      const round = analyzeKeys(keystrokes);
      if (Object.keys(round).length === 0) return;
      setProfile(mergeProfiles(profileRef.current, round));
    },
    [setProfile],
  );

  const weakKeys = useMemo<KeyStat[]>(() => selectWeakKeys(profileToStats(profile)), [profile]);

  const resetProfile = useCallback(() => {
    lastSig.current = null;
    setProfile({});
  }, [setProfile]);

  return { profile, recordRound, weakKeys, resetProfile };
}
