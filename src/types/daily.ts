export type DailyChallengeText = {
  id: string;
  content: string;
};

export type DailyEntry = {
  rank: number;
  userId: string;
  name: string | null;
  image: string | null;
  wpm: number;
  accuracy: number;
  createdAt: string;
  isMe: boolean;
};
