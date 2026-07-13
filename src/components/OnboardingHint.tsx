'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// One-time, dismissible hint that surfaces the app's less-discoverable features
// (session replay, per-word heatmap, and the history/stats icons in the header).
// Gated on localStorage so it appears only on a visitor's first session.
export const OnboardingHint = () => {
  const [seen, setSeen] = useLocalStorage('km-onboarding-seen', false);
  const [mounted, setMounted] = useState(false);

  // Avoid a flash for returning users: render nothing until we've read storage.
  useEffect(() => setMounted(true), []);

  if (!mounted || seen) return null;

  return (
    <div className="mb-6 flex items-start justify-center">
      <div className="relative flex items-start gap-2.5 rounded-lg border border-neutral-800 bg-neutral-900/60 px-3.5 py-2.5 pr-9 max-w-xl">
        <FontAwesomeIcon icon={faLightbulb} className="mt-0.5 text-yellow-500 shrink-0" size="sm" />
        <p className="font-mono text-[11px] leading-relaxed text-neutral-400">
          Finish a test to unlock a keystroke-by-keystroke{' '}
          <span className="text-neutral-200">replay</span> and a per-word{' '}
          <span className="text-neutral-200">speed heatmap</span>. Your{' '}
          <span className="text-neutral-200">history</span> and{' '}
          <span className="text-neutral-200">stats</span> live in the top-right icons.
        </p>
        <button
          onClick={() => setSeen(true)}
          aria-label="Dismiss tip"
          className="absolute right-2 top-2 cursor-pointer p-1 text-neutral-500 hover:text-neutral-200 transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} size="sm" />
        </button>
      </div>
    </div>
  );
};
