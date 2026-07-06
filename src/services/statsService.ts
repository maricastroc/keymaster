import { RoundStats } from '@/types/roundStats';

const STORAGE_KEY = '@typing-stats';
const MAX_STORED_ROUNDS = 100;

export class StatsService {
  static async saveRound(
    stats: Omit<RoundStats, 'id' | 'timestamp'>
  ): Promise<RoundStats> {
    const newRound: RoundStats = {
      ...stats,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    try {
      const existing = this.getStoredRounds();

      const isDuplicate = existing.some((round) => {
        const timeDiff = Math.abs(round.timestamp - newRound.timestamp);
        return (
          timeDiff < 3000 &&
          round.wpm === newRound.wpm &&
          round.accuracy === newRound.accuracy &&
          round.time === newRound.time &&
          round.mode === newRound.mode &&
          round.difficulty === newRound.difficulty
        );
      });

      if (isDuplicate) {
        return existing[0];
      }

      const updated = [newRound, ...existing].slice(0, MAX_STORED_ROUNDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      window.dispatchEvent(
        new CustomEvent('statsUpdated', {
          detail: { newRound, allRounds: updated },
        })
      );
    } catch (error) {
      console.error('Error saving statistics:', error);
      this.cleanupOldRounds();
    }

    return newRound;
  }

  static deleteRound(id: string): void {
    const rounds = this.getStoredRounds().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
    window.dispatchEvent(new CustomEvent('statsUpdated'));
  }

  static getStoredRounds(): RoundStats[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static cleanupOldRounds() {
    const rounds = this.getStoredRounds();
    if (rounds.length > MAX_STORED_ROUNDS) {
      const trimmed = rounds.slice(0, MAX_STORED_ROUNDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
