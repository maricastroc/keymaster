import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye } from '@fortawesome/free-solid-svg-icons';

import type { Keystroke } from '@/types/keyStore';
import { KeyboardHeatmap } from './KeyboardHeatmap';
import { analyzeKeys, profileToStats, selectWeakKeys, type KeyStat } from './logic/keyStats';

type Props = {
  /** The just-finished round's keystrokes — drives the per-key keyboard view. */
  keystrokes: Keystroke[];
  /** Weak keys accumulated across all rounds (more reliable than one round). */
  accumulatedWeak: KeyStat[];
  /** Turn on persistent practice mode for the user's weak keys. */
  onPractice: () => void;
};

export const KeyInsights = ({ keystrokes, accumulatedWeak, onPractice }: Props) => {
  const roundStats = useMemo(() => profileToStats(analyzeKeys(keystrokes)), [keystrokes]);
  const roundWeak = useMemo(() => selectWeakKeys(roundStats), [roundStats]);

  const weak = accumulatedWeak.length >= 3 ? accumulatedWeak : roundWeak;

  if (roundStats.length === 0) return null;

  return (
    <section className="mt-10 flex w-full max-w-5xl flex-col gap-4 sm:mt-16">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
          Key Analysis
        </h2>
      </div>

      <p className="-mt-2 text-xs text-neutral-500">
        Each key is shaded by how you did on it this run. Hover a key for details, then drill your
        weakest ones.
      </p>

      <KeyboardHeatmap stats={roundStats} />

      {weak.length > 0 && (
        <div className="mt-2 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">
              weakest keys
            </span>
            {weak.map((s) => (
              <span
                key={s.key}
                title={`${s.accuracy}% accuracy${s.avgMs ? `, ${s.avgMs}ms avg` : ''}`}
                className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 font-mono text-xs"
              >
                <span className="font-bold text-red-500">{s.key.toUpperCase()}</span>
                <span className="text-neutral-500">{s.accuracy}%</span>
              </span>
            ))}
          </div>

          <button
            onClick={onPractice}
            className="flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 font-mono text-sm text-neutral-300 transition-colors hover:border-yellow-500 hover:text-yellow-500"
          >
            <FontAwesomeIcon icon={faBullseye} size="sm" />
            Practice these keys
          </button>
        </div>
      )}
    </section>
  );
};
