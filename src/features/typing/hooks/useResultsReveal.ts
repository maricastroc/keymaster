import { useEffect, useState } from 'react';

/**
 * Orchestrates the hand-off from a finished test to the results view: fade the
 * text out first, then reveal the results after the fade. Resets both — and the
 * "new best" flag — as soon as a fresh round begins.
 *
 * `setIsNewBest` stays owned by the caller because it's also written from the
 * engine's onFinished (before `isCompleted` flips), which runs earlier in the
 * component than this hook can.
 */
export function useResultsReveal(
  isCompleted: boolean,
  setIsNewBest: (value: boolean) => void
) {
  const [showResults, setShowResults] = useState(false);
  const [textFading, setTextFading] = useState(false);

  useEffect(() => {
    if (!isCompleted) {
      setShowResults(false);
      setTextFading(false);
      setIsNewBest(false);
      return;
    }
    setTextFading(true);
    const t = setTimeout(() => setShowResults(true), 350);
    return () => clearTimeout(t);
  }, [isCompleted]);

  return { showResults, textFading };
}
