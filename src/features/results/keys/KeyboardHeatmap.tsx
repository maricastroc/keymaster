import { useMemo, useState } from 'react';
import type { KeyStat } from './logic/keyStats';

const SCALE = [
  'var(--color-red-500)',
  'var(--color-orange-500)',
  'var(--color-neutral-500)',
  'var(--color-yellow-500)',
  'var(--color-neutral-0)',
] as const;

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'] as const;

type Metric = 'accuracy' | 'speed';

function accuracyBucket(accuracy: number): number {
  if (accuracy >= 100) return 4;
  if (accuracy >= 97) return 3;
  if (accuracy >= 93) return 2;
  if (accuracy >= 85) return 1;
  return 0;
}

function makeSpeedBucket(msValues: number[]) {
  const sorted = [...msValues].sort((a, b) => a - b);
  const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
  return (ms: number): number => {
    if (median <= 0 || ms <= 0) return 2;
    const ratio = ms / median;
    if (ratio <= 0.75) return 4;
    if (ratio <= 0.9) return 3;
    if (ratio <= 1.1) return 2;
    if (ratio <= 1.35) return 1;
    return 0;
  };
}

type Props = {
  stats: KeyStat[];
};

export const KeyboardHeatmap = ({ stats }: Props) => {
  const [metric, setMetric] = useState<Metric>('accuracy');

  const byKey = useMemo(() => new Map(stats.map((s) => [s.key, s])), [stats]);
  const speedBucket = useMemo(
    () => makeSpeedBucket(stats.filter((s) => s.avgMs > 0).map((s) => s.avgMs)),
    [stats],
  );

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex flex-col items-center gap-2">
        {ROWS.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1.5">
            {row.split('').map((char) => {
              const stat = byKey.get(char);
              const bucket = stat
                ? metric === 'accuracy'
                  ? accuracyBucket(stat.accuracy)
                  : speedBucket(stat.avgMs)
                : null;

              const title = stat
                ? `${char.toUpperCase()} — ${stat.presses} press${stat.presses === 1 ? '' : 'es'}, ${stat.accuracy}% accuracy${stat.avgMs ? `, ${stat.avgMs}ms avg` : ''}`
                : `${char.toUpperCase()} — not typed`;

              return (
                <div
                  key={char}
                  title={title}
                  className="flex h-8 w-8 items-center justify-center rounded-md border font-mono text-sm select-none sm:h-9 sm:w-9"
                  style={
                    bucket === null
                      ? { borderColor: 'var(--color-neutral-800)', color: 'var(--color-neutral-700)' }
                      : {
                          borderColor: 'transparent',
                          backgroundColor: SCALE[bucket],
                          color: bucket >= 3 ? 'var(--color-neutral-900)' : 'var(--color-neutral-0)',
                        }
                  }
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <MetricButton active={metric === 'accuracy'} onClick={() => setMetric('accuracy')}>
          accuracy
        </MetricButton>
        <MetricButton active={metric === 'speed'} onClick={() => setMetric('speed')}>
          speed
        </MetricButton>
      </div>
    </div>
  );
};

function MetricButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs uppercase tracking-wider transition-colors ${
        active ? 'text-neutral-300' : 'text-neutral-600 hover:text-neutral-400'
      }`}
    >
      {children}
    </button>
  );
}
