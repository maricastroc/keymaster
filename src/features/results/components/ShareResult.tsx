'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareNodes, faCheck } from '@fortawesome/free-solid-svg-icons';
import { generateResultCard } from '../logic/resultCard';

type Props = {
  wpm: number;
  accuracy: number;
  consistency: number;
  mode: string;
  difficulty: string;
};

const APP_URL = 'https://keymaster.marianacastro.dev';

export function ShareResult({ wpm, accuracy, consistency, mode, difficulty }: Props) {
  const [state, setState] = useState<'idle' | 'working'>('idle');
  const [doneLabel, setDoneLabel] = useState<string | null>(null);

  const handleShare = async () => {
    if (state === 'working') return;
    setState('working');
    setDoneLabel(null);

    const summary = `Keymaster — ${wpm} WPM · ${accuracy}% accuracy (${mode} · ${difficulty})`;

    try {
      const blob = await generateResultCard({ wpm, accuracy, consistency, mode, difficulty });
      const file = blob
        ? new File([blob], 'keymaster-result.png', { type: 'image/png' })
        : null;

      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Keymaster', text: summary });
        setDoneLabel('Shared');
      } else if (navigator.share) {
        await navigator.share({ title: 'Keymaster', text: summary, url: APP_URL });
        setDoneLabel('Shared');
      } else {
        // No Web Share: download the card and copy the summary to the clipboard.
        if (blob) {
          const href = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = href;
          a.download = 'keymaster-result.png';
          a.click();
          URL.revokeObjectURL(href);
        }
        try {
          await navigator.clipboard?.writeText(`${summary} — ${APP_URL}`);
        } catch {
          /* ignore */
        }
        setDoneLabel(blob ? 'Saved & copied' : 'Copied');
      }
    } catch {
      // Share cancelled or failed — silently reset.
      setState('idle');
      return;
    }

    setState('idle');
    window.setTimeout(() => setDoneLabel(null), 2500);
  };

  return (
    <button
      onClick={handleShare}
      disabled={state === 'working'}
      aria-label="Share result"
      className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 font-mono text-sm text-neutral-400 hover:border-neutral-500 hover:text-neutral-300 transition-colors disabled:opacity-50"
    >
      <FontAwesomeIcon icon={doneLabel ? faCheck : faShareNodes} size="sm" />
      {doneLabel ?? (state === 'working' ? 'Preparing…' : 'Share result')}
    </button>
  );
}
