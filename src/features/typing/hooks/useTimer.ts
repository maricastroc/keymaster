import { useState, useRef, useCallback, useEffect } from 'react';

export const useTimer = (initialTime: number, mode: 'timed' | 'passage') => {
  const [elapsed, setElapsed] = useState(mode === 'timed' ? initialTime : 0);

  const isRunningRef = useRef(false);

  const [isRunning, setIsRunning] = useState(false);

  const startTimeRef = useRef<number | null>(null);

  const pausedTimeRef = useRef<number | null>(null);

  const totalPausedRef = useRef(0);

  const rafRef = useRef<number | null>(null);

  const lastSecondRef = useRef<number>(mode === 'timed' ? initialTime : 0);

  useEffect(() => {
    setIsRunning(isRunningRef.current);
  }, [elapsed]);

  const cancelRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Monotonic milliseconds elapsed since the timer first started, excluding
  // paused spans. Unlike `elapsed` (which counts *down* in timed mode and is
  // rounded to whole seconds), this always increases from 0 and keeps
  // sub-second precision — the correct clock for stamping keystrokes.
  const getElapsedMs = useCallback(() => {
    if (startTimeRef.current === null) return 0;
    const now = Date.now();
    const pausedExtra =
      pausedTimeRef.current !== null ? now - pausedTimeRef.current : 0;
    return Math.max(0, now - startTimeRef.current - totalPausedRef.current - pausedExtra);
  }, []);

  const tick = useCallback(() => {
    if (!startTimeRef.current || !isRunningRef.current) {
      cancelRaf();
      return;
    }

    const now = Date.now();
    const currentElapsed = Math.floor(
      (now - startTimeRef.current - totalPausedRef.current) / 1000
    );

    const nextValue =
      mode === 'timed'
        ? Math.max(0, initialTime - currentElapsed)
        : currentElapsed;

    if (nextValue !== lastSecondRef.current) {
      lastSecondRef.current = nextValue;
      setElapsed(nextValue);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [mode, initialTime, cancelRaf]);

  const pause = useCallback(() => {
    if (!isRunningRef.current) return;

    cancelRaf();

    isRunningRef.current = false;

    pausedTimeRef.current = Date.now();

    setIsRunning(false);
  }, [elapsed, cancelRaf]);

  const start = useCallback(() => {
    if (isRunningRef.current) return;

    if (!startTimeRef.current) startTimeRef.current = Date.now();

    isRunningRef.current = true;
    setIsRunning(true);

    cancelRaf();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, cancelRaf]);

  const resume = useCallback(() => {
    if (isRunningRef.current) return;

    if (pausedTimeRef.current) {
      totalPausedRef.current += Date.now() - pausedTimeRef.current;
    }

    pausedTimeRef.current = null;
    isRunningRef.current = true;
    setIsRunning(true);

    cancelRaf();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick, cancelRaf]);

  const resetTimer = useCallback(() => {
    cancelRaf();

    startTimeRef.current = null;
    pausedTimeRef.current = null;
    totalPausedRef.current = 0;
    isRunningRef.current = false;

    const initial = mode === 'timed' ? initialTime : 0;
    lastSecondRef.current = initial;
    setElapsed(initial);
    setIsRunning(false);
  }, [mode, initialTime, cancelRaf]);

  useEffect(() => {
    return () => {
      cancelRaf();
    };
  }, [cancelRaf]);

  return { elapsed, start, pause, resume, isRunning, resetTimer, getElapsedMs };
};
