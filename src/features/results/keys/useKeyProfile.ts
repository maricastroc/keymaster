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

export function useKeyProfile() {
  const [profile, setProfile] = useLocalStorage<KeyProfile>(STORAGE_KEY, {});

  const profileRef = useRef(profile);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

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
