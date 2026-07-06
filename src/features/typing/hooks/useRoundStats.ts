import { useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { StatsService } from '@/services/statsService';
import { roundsApi } from '@/services/roundsApi';
import { mutate } from 'swr';
import { useConfig } from '@/features/settings/context/ConfigContext';

export const useRoundStats = () => {
  const { mode, difficulty } = useConfig();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;

  const lastSavedRef = useRef<{
    timestamp: number;
    wpm: number;
    time: number;
  } | null>(null);

  const saveRound = useCallback(
    async (statsData: { wpm: number; accuracy: number; time: number }) => {
      const now = Date.now();

      if (lastSavedRef.current) {
        const { wpm, time } = lastSavedRef.current;
        const isSameRound =
          wpm === statsData.wpm &&
          time === statsData.time &&
          now - lastSavedRef.current.timestamp < 1000;
        if (isSameRound) return null;
      }

      lastSavedRef.current = { timestamp: now, wpm: statsData.wpm, time: statsData.time };

      const payload = { ...statsData, mode, difficulty };

      if (isLoggedIn) {
        const round = await roundsApi.saveRound(payload);
        mutate('/api/rounds');
        return round;
      }

      return StatsService.saveRound(payload);
    },
    [mode, difficulty, isLoggedIn]
  );

  const getHistory = useCallback(() => {
    return StatsService.getStoredRounds();
  }, []);

  const deleteRound = useCallback((id: string) => {
    StatsService.deleteRound(id);
  }, []);

  return {
    isLoggedIn,
    saveRound,
    getHistory,
    deleteRound,
  };
};
