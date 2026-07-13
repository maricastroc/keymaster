import useSWR from 'swr';
import type { LeaderboardPeriod, LeaderboardResponse } from '@/types/leaderboard';

const fetcher = (url: string): Promise<LeaderboardResponse> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error('Failed to load leaderboard');
    return r.json();
  });

export function useLeaderboard(period: LeaderboardPeriod) {
  const { data, error, isLoading } = useSWR<LeaderboardResponse>(
    `/api/leaderboard?period=${period}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  return {
    entries: data?.entries ?? [],
    me: data?.me ?? null,
    isLoading,
    error,
  };
}
