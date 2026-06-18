import { useConfig } from '@/features/settings/context/ConfigContext';
import { GeneralStats } from '@/types/generalStats';
import { capitalize } from '@/utils/capitalizeText';

type ResumeSectionProps = {
  generalStats: GeneralStats;
  finishedTime: number | null;
};

export const ResumeSection = ({
  generalStats,
  finishedTime,
}: ResumeSectionProps) => {
  const { mode, category } = useConfig();

  const formatTime = (seconds: number | null) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="mt-4 w-full max-w-5xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0 w-full divide-x divide-neutral-800">
        <div className="flex flex-col items-center justify-center px-6 py-4">
          <p className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-2">test type</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <span className="font-mono text-xs text-neutral-500 bg-neutral-800 px-2.5 py-1 rounded-full">
              {capitalize(mode)}
            </span>
            <span className="font-mono text-xs text-neutral-500 bg-neutral-800 px-2.5 py-1 rounded-full">
              {capitalize(category)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-4">
          <p className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-1">raw</p>
          <span className="font-mono font-bold text-xl text-neutral-400">{generalStats?.raw}</span>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-4">
          <p className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-1">consistency</p>
          <span className="font-mono font-bold text-xl text-neutral-400">{generalStats?.consistency}%</span>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-4">
          <p className="font-mono text-xs text-neutral-500 uppercase tracking-wider mb-1">time</p>
          <span className="font-mono font-bold text-xl text-neutral-400">{formatTime(finishedTime)}</span>
        </div>
      </div>
    </div>
  );
};
