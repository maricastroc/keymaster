import { useEffect } from 'react';

const IGNORED_KEYS = ['Escape', 'Shift', 'Control', 'Alt', 'Meta'];

/**
 * While paused, let any real keypress resume the run (not just clicking the
 * overlay). The hidden input lost focus when the tab was hidden, so a plain
 * keystroke wouldn't reach the engine — this window-level listener bridges that
 * gap. The resuming key is consumed (it only resumes; it isn't typed).
 *
 * Esc is left for the restart shortcut, and modifier-only presses are ignored so
 * alt-tabbing back doesn't spuriously resume.
 */
export function useResumeOnKey(isPaused: boolean, onResume: () => void) {
  useEffect(() => {
    if (!isPaused) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (IGNORED_KEYS.includes(e.key)) return;
      e.preventDefault();
      onResume();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPaused, onResume]);
}
