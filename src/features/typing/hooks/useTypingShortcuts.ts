import { useEffect, useState } from 'react';

type Params = {
  currentText: string;
  /**
   * When true, Esc is left alone (e.g. the history drawer is open and Radix
   * needs Esc to close it) instead of restarting the test.
   */
  blocked: boolean;
  onRestart: () => void;
};

/**
 * Tracks Caps Lock state (for the on-screen indicator) and wires Esc to restart
 * the current text. Returns whether Caps Lock is currently on.
 */
export function useTypingShortcuts({ currentText, blocked, onRestart }: Params) {
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    const syncCaps = (e: KeyboardEvent) => setCapsLockOn(e.getModifierState('CapsLock'));
    const onKeyDown = (e: KeyboardEvent) => {
      syncCaps(e);
      if (e.key === 'Escape' && !blocked && currentText) {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', syncCaps);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', syncCaps);
    };
  }, [blocked, currentText, onRestart]);

  return capsLockOn;
}
