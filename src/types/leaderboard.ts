export type LeaderboardPeriod = 'all' | 'week';

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  wpm: number;
  accuracy: number;
  mode: string;
  difficulty: string;
  createdAt: string;
  isMe: boolean;
};

export type LeaderboardResponse = {
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  me: LeaderboardEntry | null;
};
