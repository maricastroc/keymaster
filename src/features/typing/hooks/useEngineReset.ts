import { useEffect, type MutableRefObject } from 'react';

type Params = {
  currentText: string;
  initialTime: number;
  hasInteractedRef: MutableRefObject<boolean>;
  reset: (text: string) => void;
  prepare: () => void;
};

/**
 * Re-arm the typing engine whenever the text changes (initial load, Randomize,
 * Next, custom paste) or the timer duration changes. Once the user has engaged,
 * land ready-to-type rather than re-showing the Start overlay — the first load
 * leaves `hasInteractedRef` false so the overlay still appears then.
 */
export function useEngineReset({
  currentText,
  initialTime,
  hasInteractedRef,
  reset,
  prepare,
}: Params) {
  useEffect(() => {
    if (!currentText) return;
    reset(currentText);
    if (hasInteractedRef.current) prepare();
  }, [currentText]);

  useEffect(() => {
    if (!currentText) return;
    reset(currentText);

    if (hasInteractedRef.current) prepare();
  }, [initialTime]);
}
