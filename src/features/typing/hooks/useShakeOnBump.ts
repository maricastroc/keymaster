import { useEffect, useState } from 'react';

/**
 * Turns a monotonically increasing "bump" counter into a short-lived boolean the
 * UI can use to trigger a shake animation. Stays true through a burst (each bump
 * re-arms the timer) and settles shortly after the last one.
 */
export function useShakeOnBump(bump: number, durationMs = 250) {
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (!bump) return;
    setShaking(true);
    const t = setTimeout(() => setShaking(false), durationMs);
    return () => clearTimeout(t);
  }, [bump, durationMs]);

  return shaking;
}
