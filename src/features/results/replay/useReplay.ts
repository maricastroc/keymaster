import { useEffect, useRef, useState, useCallback } from 'react';
import { Keystroke } from '@/types/keyStore';

type Props = {
  keystrokes: Keystroke[];
  onKeystroke?: () => void;
};

export const useReplay = ({ keystrokes, onKeystroke }: Props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeystrokesRef = useRef(keystrokes);

  useEffect(() => {
    if (lastKeystrokesRef.current !== keystrokes) {
      setCurrentIndex(0);
      setIsPlaying(false);
      lastKeystrokesRef.current = keystrokes;
    }
  }, [keystrokes]);

  useEffect(() => {
    if (!isPlaying || currentIndex >= keystrokes.length) {
      if (isPlaying && currentIndex >= keystrokes.length) setIsPlaying(false);
      return;
    }

    const current = keystrokes[currentIndex];
    const prev = currentIndex > 0 ? keystrokes[currentIndex - 1] : null;
    if (!current) return;

    const delay = prev
      ? Math.min(current.timestampMs - prev.timestampMs, 300)
      : 100;

    timeoutRef.current = setTimeout(() => {
      onKeystroke?.();
      setCurrentIndex((i) => i + 1);
    }, Math.max(delay, 30));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, currentIndex, keystrokes, onKeystroke]);

  const play = useCallback(() => {
    if (currentIndex >= keystrokes.length) setCurrentIndex(0);
    setIsPlaying(true);
  }, [currentIndex, keystrokes.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const jumpToIndex = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, keystrokes.length)));
    },
    [keystrokes.length],
  );

  return { isPlaying, play, pause, reset, currentIndex, jumpToIndex };
};
