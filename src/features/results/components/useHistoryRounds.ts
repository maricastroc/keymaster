import useSWR from 'swr';
import { useRoundStats } from '@/features/typing/hooks/useRoundStats';
import { roundsApi } from '@/services/roundsApi';

export type ModeFilter = 'all' | 'timed' | 'passage';
export type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

/**
 * Owns the history data concern: source selection (persisted API rounds for
 * signed-in users, localStorage otherwise), filtering, the best WPM within the
 * current filter, loading state, and deletion. Keeps the drawer component purely
 * about presentation and open/close animation.
 */
export function useHistoryRounds(filterMode: ModeFilter, filterDifficulty: DifficultyFilter) {
  const { getHistory, deleteRound, isLoggedIn } = useRoundStats();

  const { data: apiRounds, mutate } = useSWR(
    isLoggedIn ? '/api/rounds' : null,
    () => roundsApi.fetchRounds()
  );

  const allRounds = isLoggedIn ? (apiRounds ?? []) : getHistory();
  const rounds = allRounds.filter(
    (r) =>
      (filterMode === 'all' || r.mode === filterMode) &&
      (filterDifficulty === 'all' || r.difficulty === filterDifficulty)
  );

  // Best within the current filter, so the crown reflects what's on screen.
  const personalBest = rounds.length > 0 ? Math.max(...rounds.map((r) => r.wpm)) : 0;

  const isLoadingHistory = isLoggedIn && apiRounds === undefined;

  const handleDelete = async (id: string) => {
    if (isLoggedIn) {
      await roundsApi.deleteRound(id);
      mutate(apiRounds?.filter((r) => r.id !== id), { revalidate: true });
    } else {
      deleteRound(id);
    }
  };

  return { allRounds, rounds, personalBest, isLoadingHistory, isLoggedIn, deleteRound: handleDelete };
}
