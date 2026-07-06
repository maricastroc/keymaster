import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { StatsService } from '@/services/statsService';
import { roundsApi } from '@/services/roundsApi';
import { useConfig } from '@/features/settings/context/ConfigContext';
import { RoundStats } from '@/types/roundStats';
import useSWR from 'swr';

/**
 * Best WPM for the currently selected mode + difficulty. Recomputes as the
 * config changes and as rounds are saved/deleted (same-tab `statsUpdated`
 * event for anonymous users, SWR revalidation for signed-in users).
 */
export const usePersonalBest = () => {
  const { mode, difficulty } = useConfig();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const { data: apiRounds } = useSWR(
    isLoggedIn ? '/api/rounds' : null,
    () => roundsApi.fetchRounds()
  );

  const [localRounds, setLocalRounds] = useState<RoundStats[]>([]);

  useEffect(() => {
    if (isLoggedIn) return;

    const compute = () => setLocalRounds(StatsService.getStoredRounds());
    compute();

    const onStorage = (e: StorageEvent) => {
      if (e.key === '@typing-stats') compute();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('statsUpdated', compute);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('statsUpdated', compute);
    };
  }, [isLoggedIn]);

  const rounds = isLoggedIn ? apiRounds ?? [] : localRounds;
  const inBucket = rounds.filter(
    (r) => r.mode === mode && r.difficulty === difficulty
  );

  return inBucket.length > 0 ? Math.max(...inBucket.map((r) => r.wpm)) : 0;
};
