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
  const accuracyColor = !isStarted
    ? 'text-neutral-400'
    : accuracy === 100
      ? 'text-green-500'
      : 'text-red-500';

  const timeColor = isStarted && mode === 'timed' ? 'text-yellow-500' : 'text-neutral-400';

  const Item = ({
    label,
    value,
    valueClass = '',
  }: {
    label: string;
    value: React.ReactNode;
    valueClass?: string;
  }) => (
    <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-4 md:px-8">
      <p className="text-preset-4 font-medium text-neutral-500">{label}</p>
      <span className={`text-xl md:text-preset-2 font-mono ${valueClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="mt-14">
      <div className="flex w-full items-center justify-center pb-4 divide-x divide-neutral-700">
        <Item label="WPM:" value={wpm} valueClass="text-neutral-300" />
        <Item label="Accuracy:" value={`${accuracy}%`} valueClass={accuracyColor} />
        <Item label="Time:" value={formatTime(timeLeft)} valueClass={timeColor} />
      </div>
      <div className="w-full h-px bg-neutral-800 overflow-hidden">
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
