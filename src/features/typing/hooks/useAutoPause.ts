import { useEffect } from 'react';

type Params = {
  isStarted: boolean;
  isCompleted: boolean;
  isPaused: boolean;
  pause: () => void;
};

/**
 * Pause an in-progress test when the tab is hidden or the window loses focus,
 * so idle time can never inflate the user's WPM.
 */
export function useAutoPause({ isStarted, isCompleted, isPaused, pause }: Params) {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStarted && !isCompleted && !isPaused) {
        pause();
      }
    };

    const handleBlur = () => {
      if (isStarted && !isCompleted && !isPaused) {
        pause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isStarted, isCompleted, isPaused, pause]);
}
