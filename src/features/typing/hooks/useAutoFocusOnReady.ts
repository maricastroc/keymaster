import { useEffect, type RefObject } from 'react';

type Params = {
  isReady: boolean;
  isStarted: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  preload: () => void;
};

/**
 * When a test is armed but not yet started, focus the hidden input and warm the
 * current sound's audio buffers so the first keystroke doesn't stutter.
 */
export function useAutoFocusOnReady({ isReady, isStarted, inputRef, preload }: Params) {
  useEffect(() => {
    if (isReady && !isStarted) {
      inputRef.current?.focus();
      preload();
    }
  }, [isReady, isStarted, preload]);
}
