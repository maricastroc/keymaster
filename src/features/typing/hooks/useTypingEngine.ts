import { useMemo, useCallback, useEffect, useRef, useReducer } from 'react';

import { useConfig } from '@/features/settings/context/ConfigContext';
import { useTimer } from './useTimer';
import { buildChartData } from '@/utils/buildChartData';
import { engineReducer, createInitialState } from './engineReducer';
import {
  canAdvanceWord,
  canTypeMoreChars,
  isLastWordComplete,
  calculateMetrics,
} from '@/features/typing/logic/typing';

import type { RoundStats } from '@/types/roundStats';
import type { HistoryStats } from '@/types/historyStats';

interface TypingOptions {
  onError?: () => void;
  onSuccess?: () => void;
  onFinished?: (data: HistoryStats) => void;
  initialTime?: number;
}

export const useTypingEngine = (text: string, options?: TypingOptions) => {
  const { mode, difficulty } = useConfig();

  const words = useMemo(() => text.split(' '), [text]);

  const [state, dispatch] = useReducer(engineReducer, words, createInitialState);
  const { activeWordIndex, userInput, keystrokes, isCompleted, isReady, hasStarted, finishedTime } =
    state;

  const initialTime = options?.initialTime ?? 60;
  const hasSavedRef = useRef(false);
  const isFinishingRef = useRef(false);

  const {
    elapsed,
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
    isRunning,
    resetTimer,
    getElapsedMs,
  } = useTimer(initialTime, mode);

  const elapsedSeconds = useMemo(
    () => (mode === 'timed' ? initialTime - elapsed : elapsed),
    [mode, elapsed, initialTime]
  );

  const metrics = useMemo(() => {
    if (!hasStarted || keystrokes.length === 0) return { wpm: 0, accuracy: 100 };
    return calculateMetrics(keystrokes, elapsedSeconds);
  }, [keystrokes, elapsedSeconds, hasStarted]);

  const totalTimeSpent = useMemo(
    () => (finishedTime !== null ? finishedTime : elapsed),
    [finishedTime, elapsed]
  );

  // The chart is only shown on the results screen, so there's no reason to
  // rebuild it (an O(n) pass over every keystroke) on each keypress. Build it
  // once the round completes. This also keeps calculateGeneralStats cheap
  // mid-round, since it early-returns on empty chart data.
  const chartData = useMemo(
    () => (isCompleted ? buildChartData(keystrokes, totalTimeSpent) : []),
    [isCompleted, keystrokes, totalTimeSpent]
  );

  const finishTest = useCallback(() => {
    if (isFinishingRef.current || isCompleted || !hasStarted || hasSavedRef.current) return;

    isFinishingRef.current = true;
    hasSavedRef.current = true;

    pauseTimer();

    const finalTime = mode === 'timed' ? initialTime - elapsed : elapsed;
    dispatch({ type: 'FINISH', finalTime });

    const valid = keystrokes.filter((k) => k.typedChar !== 'Backspace');
    if (valid.length === 0) {
      isFinishingRef.current = false;
      return;
    }

    options?.onFinished?.({ wpm: metrics.wpm, accuracy: metrics.accuracy, time: finalTime });
  }, [isCompleted, hasStarted, pauseTimer, elapsed, keystrokes, metrics, options, mode, initialTime]);

  const handleKeyDown = useCallback(
    (key: string) => {
      if (isCompleted || !isReady) return;

      if (!isRunning && key !== 'Escape') {
        dispatch({ type: 'START' });
        startTimer();
      }

      const currentWord = words[activeWordIndex];
      const currentTyped = userInput[activeWordIndex];
      if (!currentWord || currentTyped === undefined) return;

      // Monotonic, sub-second timestamp from the timer's own clock. Using the
      // displayed `elapsed` here was wrong: in timed mode it counts down, so
      // keystrokes were stamped in reverse, and its whole-second rounding
      // collapsed every key in the same second onto one point — breaking the
      // chart, heatmap word-speeds, and replay pacing.
      const timestampMs = getElapsedMs();

      if (key.length === 1 && key !== ' ') {
        if (!canTypeMoreChars(currentTyped, currentWord)) return;
        const charPosInWord = currentTyped.length;
        const wordStartOffset = words.slice(0, activeWordIndex).reduce((acc, w) => acc + w.length + 1, 0);
        const charIndex = wordStartOffset + charPosInWord;
        const expectedChar = currentWord[charPosInWord] ?? '';
        const isCorrect = key === expectedChar;
        if (isCorrect) options?.onSuccess?.();
        else options?.onError?.();
        dispatch({ type: 'TYPE_CHAR', wordIndex: activeWordIndex, char: key, isCorrect, timestampMs, charIndex, expectedChar });
        return;
      }

      if (key === ' ') {
        if (canAdvanceWord(currentTyped, activeWordIndex, words.length)) {
          dispatch({ type: 'ADVANCE_WORD' });
        }
        return;
      }

      if (key === 'Backspace') {
        dispatch({ type: 'BACKSPACE', wordIndex: activeWordIndex });
      }
    },
    [isRunning, isReady, isCompleted, startTimer, getElapsedMs, words, activeWordIndex, userInput, options]
  );

  const prepare = useCallback(() => {
    dispatch({ type: 'PREPARE' });
  }, []);

  const reset = useCallback(
    (newText: string) => {
      const newWords = newText.split(' ');
      hasSavedRef.current = false;
      isFinishingRef.current = false;
      resetTimer();
      dispatch({ type: 'RESET', words: newWords });
    },
    [resetTimer]
  );

  const start = useCallback(() => {
    dispatch({ type: 'START' });
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (isCompleted || !hasStarted) return;

    const shouldFinish =
      isLastWordComplete(activeWordIndex, words, userInput) ||
      (mode === 'timed' && elapsed <= 0 && isRunning);

    if (shouldFinish && !isFinishingRef.current) finishTest();
  }, [activeWordIndex, userInput, words, mode, elapsed, isRunning, isCompleted, hasStarted, finishTest]);

  const getRoundStats = useCallback((): Omit<RoundStats, 'id' | 'timestamp'> | null => {
    if (!finishedTime || !metrics.wpm) return null;
    return { mode, difficulty, wpm: metrics.wpm, accuracy: metrics.accuracy, time: finishedTime };
  }, [finishedTime, metrics, mode, difficulty]);

  return {
    isStarted: hasStarted,
    isPaused: hasStarted && !isRunning && !isCompleted,
    activeWordIndex,
    userInput,
    words,
    mode,
    keystrokes,
    totalTime: totalTimeSpent,
    isCompleted,
    finishedTime,
    isReady,
    prepare,
    getRoundStats,
    start,
    handleKeyDown,
    reset,
    resume: resumeTimer,
    pause: pauseTimer,
    metrics,
    timeLeft: elapsed,
    chartData,
  };
};
