import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { roundsApi } from '@/services/roundsApi';
import { StatsService } from '@/services/statsService';
import { RoundStats } from '@/types/roundStats';

/**
 * All of the user's rounds: from the API when signed in, from localStorage
 * otherwise. Anonymous data updates live via the same-tab `statsUpdated` event
 * and cross-tab `storage` event.
 */
export function useRounds(): {
  rounds: RoundStats[];
  isLoading: boolean;
  isLoggedIn: boolean;
} {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const { data: apiRounds } = useSWR(
    isLoggedIn ? '/api/rounds' : null,
    () => roundsApi.fetchRounds()
  );

  const [localRounds, setLocalRounds] = useState<RoundStats[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isLoggedIn) return;

    const compute = () => setLocalRounds(StatsService.getStoredRounds());
    compute();
    setMounted(true);

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

  if (isLoggedIn) {
    return { rounds: apiRounds ?? [], isLoading: apiRounds === undefined, isLoggedIn };
  }
  return { rounds: localRounds, isLoading: !mounted, isLoggedIn };
}
