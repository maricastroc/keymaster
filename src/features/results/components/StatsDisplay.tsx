import { GeneralStats } from '@/types/generalStats';
import { StatCard } from './StatCard';
import { useCountUp } from '@/hooks/useCountUp';

type StatsDisplayProps = {
  stats: GeneralStats;
};

export const StatsDisplay = ({ stats }: StatsDisplayProps) => {
  const wpmCount = useCountUp(stats.wpm);

  return (
    <div className="flex flex-wrap items-center justify-center w-full gap-4 my-6 md:my-10">
      <StatCard
        label="wpm"
        value={
          <>
            <span className="font-mono font-bold text-2xl text-neutral-400 tabular-nums">{wpmCount}</span>
            <span className="font-mono text-xs text-neutral-500">avg</span>
          </>
        }
      />

      <StatCard
        label="accuracy"
        value={
          <>
            <span className={`font-mono font-bold text-2xl ${stats.accuracy === 100 ? 'text-yellow-500' : stats.accuracy >= 90 ? 'text-neutral-400' : 'text-red-500'}`}>
              {stats.accuracy}%
            </span>
            <span className="font-mono text-xs text-neutral-500">avg</span>
          </>
        }
      />

      <StatCard
        label="characters"
        value={
          <div className="flex gap-1 items-baseline">
            <span className="font-mono font-bold text-2xl text-yellow-500">{stats.characters.correct}</span>
            <span className="font-mono text-neutral-500 text-sm">/ {stats.characters.total}</span>
          </div>
        }
      />
    </div>
  );
};
