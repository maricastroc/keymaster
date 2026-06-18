import { memo, useMemo } from 'react';
import { WordStats } from './logic/history';

const HEATMAP_COLORS = [
  'var(--color-red-500)',
  '#c97f2a',
  'var(--color-neutral-500)',
  'var(--color-yellow-500)',
  'var(--color-neutral-0)',
] as const;

type Props = {
  word: string;
  stats: WordStats | null;
  isHeatmapVisible: boolean;
};

export const HeatmapWord = memo(({ word, stats, isHeatmapVisible }: Props) => {
  if (!stats) {
    return <span className="text-neutral-600 font-mono">{word} </span>;
  }

  const { wpm, hasError, errorCharIndices, extras, bucket, typedChars } = stats;

  const color =
    isHeatmapVisible && bucket !== undefined ? HEATMAP_COLORS[bucket] : undefined;

  const renderedChars = useMemo(() => {
    return word.split('').map((char, idx) => {
      const isUntyped = typedChars?.[idx] === '\0';
      const isError = !isHeatmapVisible && errorCharIndices.has(idx);
      return (
        <span
          key={idx}
          className={
            isError
              ? 'text-red-400'
              : isUntyped
                ? 'opacity-40'
                : ''
          }
        >
          {char}
        </span>
      );
    });
  }, [word, isHeatmapVisible, errorCharIndices, typedChars]);

  return (
    <span
      title={`${Math.round(wpm)} wpm`}
      style={{ color }}
      className={`font-mono cursor-default ${!isHeatmapVisible && hasError ? 'underline decoration-red-400 decoration-2' : ''}`}
    >
      {renderedChars}
      {extras && extras.length > 0 && (
        <span className="text-red-400 text-xs">+{extras.length}</span>
      )}
      {' '}
    </span>
  );
});

HeatmapWord.displayName = 'HeatmapWord';
