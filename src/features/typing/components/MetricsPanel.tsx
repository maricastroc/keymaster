import { formatTime } from '@/utils/formatTime';

type Metrics = {
  wpm: number;
  accuracy: number;
};

type MetricsPanelProps = {
  metrics: Metrics;
  mode: 'timed' | 'passage';
  isStarted: boolean;
  timeLeft: number;
  progress?: number;
};

export const MetricsPanel = ({
  metrics: { wpm, accuracy },
  mode,
  isStarted,
  timeLeft,
  progress = 0,
}: MetricsPanelProps) => {
  return (
    <div className="mt-4 mb-6">
      {isStarted ? (
        <div className="flex items-end gap-8">
          <span className="font-mono text-5xl font-bold text-yellow-500 tabular-nums leading-none">
            {mode === 'timed' ? formatTime(timeLeft) : `${wpm}`}
          </span>
          <div className="flex items-center gap-4 pb-1 text-neutral-500 font-mono text-sm">
            {mode === 'timed' && (
              <span>{wpm} <span className="text-xs">wpm</span></span>
            )}
            <span className={accuracy < 90 ? 'text-red-500' : ''}>{accuracy}%</span>
          </div>
        </div>
      ) : (
        <div className="h-14" />
      )}
      <div className="mt-3 w-full h-px bg-neutral-700 overflow-hidden">
        {isStarted && (
          <div
            className="h-full bg-yellow-500 transition-all duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        )}
      </div>
    </div>
  );
};
