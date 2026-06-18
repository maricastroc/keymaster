import { useMemo, useState } from 'react';
import { analyzeHeatmap } from './logic/history';
import { HeatmapWord } from './HeatmapWord';
import { Keystroke } from '@/types/keyStore';

const HEATMAP_COLORS = [
  'var(--color-red-500)',
  '#c97f2a',
  'var(--color-neutral-500)',
  'var(--color-yellow-500)',
  'var(--color-neutral-0)',
] as const;

const LABELS = ['Very Slow', 'Slow', 'Average', 'Fast', 'Very Fast'];

type Props = {
  keystrokes: Keystroke[];
  text: string;
};

export const Heatmap = ({ keystrokes, text }: Props) => {
  const [isHeatmapVisible, setIsHeatmapVisible] = useState(true);

  const analysis = useMemo(() => analyzeHeatmap(keystrokes, text), [keystrokes, text]);

  if (!analysis) return null;

  const { wordStatsMap, buckets, words } = analysis;

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4">
      <div className="flex items-center justify-between mt-10 sm:mt-16">
        <h2 className="text-neutral-400 font-semibold text-sm uppercase tracking-widest">
          Word Heatmap
        </h2>
        <button
          onClick={() => setIsHeatmapVisible((v) => !v)}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition"
        >
          {isHeatmapVisible ? 'Show errors' : 'Show heatmap'}
        </button>
      </div>

      <div className="leading-loose text-base">
        {words.map((word, idx) => (
          <HeatmapWord
            key={idx}
            word={word}
            stats={wordStatsMap.get(idx) ?? null}
            isHeatmapVisible={isHeatmapVisible}
          />
        ))}
      </div>

      {isHeatmapVisible && buckets.length > 0 && (
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: HEATMAP_COLORS[i] }}
              />
              <span className="text-xs text-neutral-500">{label}</span>
              {buckets[i] !== undefined && buckets[i + 1] !== undefined && (
                <span className="text-xs text-neutral-600">
                  ({buckets[i]}–{buckets[i + 1]} wpm)
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
