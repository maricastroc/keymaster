import { useMemo, useCallback, useEffect, useRef, useReducer, useState } from 'react';

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

import type { HistoryStats } from '@/types/historyStats';

interface TypingOptions {
  onError?: () => void;
  onSuccess?: () => void;
  onFinished?: (data: HistoryStats) => void;
  initialTime?: number;
  /** Force a mode instead of reading the global config (used by the daily
   * challenge, which is always a full passage). */
  mode?: 'timed' | 'passage';
}

export const useTypingEngine = (text: string, options?: TypingOptions) => {
  const { mode: configMode } = useConfig();
  const mode = options?.mode ?? configMode;

  const words = useMemo(() => text.split(' '), [text]);

  const [state, dispatch] = useReducer(engineReducer, words, createInitialState);
  const { activeWordIndex, userInput, keystrokes, isCompleted, isReady, hasStarted, finishedTime } =
    state;

  const initialTime = options?.initialTime ?? 60;
  const hasSavedRef = useRef(false);
  const isFinishingRef = useRef(false);

  // Increments each time a keystroke is rejected at the overflow cap, so the UI
  // can nudge (shake) the current word instead of the input dead-ending silently.
  const [overflowBump, setOverflowBump] = useState(0);

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

      const timestampMs = getElapsedMs();

      if (key.length === 1 && key !== ' ') {
        if (!canTypeMoreChars(currentTyped, currentWord)) {
          // Hit the overflow wall: reject the char but make it legible — an
          // error tick + a shake bump — rather than swallowing input silently.
          options?.onError?.();
          setOverflowBump((n) => n + 1);
          return;
        }
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

  useEffect(() => {
    if (isCompleted || !hasStarted) return;

    const shouldFinish =
      isLastWordComplete(activeWordIndex, words, userInput) ||
      (mode === 'timed' && elapsed <= 0 && isRunning);

    if (shouldFinish && !isFinishingRef.current) finishTest();
  }, [activeWordIndex, userInput, words, mode, elapsed, isRunning, isCompleted, hasStarted, finishTest]);

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
    handleKeyDown,
    reset,
    resume: resumeTimer,
    pause: pauseTimer,
    metrics,
    timeLeft: elapsed,
    chartData,
    overflowBump,
  };
};
