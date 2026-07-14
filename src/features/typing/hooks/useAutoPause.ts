import { useEffect } from 'react';

type Params = {
  isStarted: boolean;
  isCompleted: boolean;
  isPaused: boolean;
  pause: () => void;
};

/**
 * Pause an in-progress test when the tab is actually hidden — switched away or
 * minimized — so idle time can't wreck the run.
 *
 * Deliberately listens only to `visibilitychange`, not `window blur`: blur also
 * fires for benign focus changes (clicking the address bar, opening devtools,
 * alt-tabbing to another app or monitor), which would pause mid-flow with no
 * real tab switch. `document.hidden` fires only on a genuine tab hide/minimize.
 */
export function useAutoPause({ isStarted, isCompleted, isPaused, pause }: Params) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStarted && !isCompleted && !isPaused) {
        pause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isStarted, isCompleted, isPaused, pause]);
}
