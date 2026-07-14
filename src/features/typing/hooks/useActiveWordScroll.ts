import { useEffect, type RefObject } from 'react';

type Params = {
  activeWordIndex: number;
  isStarted: boolean;
  isReady: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
};

/**
 * Keeps the active word centered in the scrolling word view as the user types,
 * honoring the user's reduced-motion preference.
 */
export function useActiveWordScroll({
  activeWordIndex,
  isStarted,
  isReady,
  containerRef,
}: Params) {
  useEffect(() => {
    if (!isReady) return;

    const currentWordEl = containerRef.current?.querySelector<HTMLElement>(
      `[data-word-index="${activeWordIndex}"]`
    );

    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    currentWordEl?.scrollIntoView({
      block: 'center',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [activeWordIndex, isStarted, isReady]);
}
