import { useEffect, useRef, type RefObject } from 'react';

import { keysFromInput } from '@/features/typing/logic/inputEvents';

const SENTINEL = ' ';

type Params = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  /** The engine's `handleKeyDown`. */
  onKey: (key: string) => void;
};

export function useTypingInput({ inputRef, onKey }: Params) {
  const composingRef = useRef(false);

  const onKeyRef = useRef(onKey);
  useEffect(() => {
    onKeyRef.current = onKey;
  });

  const armField = () => {
    const el = inputRef.current;
    if (!el) return;
    if (el.value !== SENTINEL) el.value = SENTINEL;
    const end = el.value.length;
    try {
      el.setSelectionRange(end, end);
    } catch {
      //
    }
  };

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    el.value = SENTINEL;

    const emit = (inputType: string, data: string | null) => {
      for (const key of keysFromInput(inputType, data)) onKeyRef.current(key);
    };

    const onBeforeInput = (e: InputEvent) => {
      if (composingRef.current || e.isComposing) return;

      e.preventDefault();
      emit(e.inputType, e.data);
    };

    const onInput = () => {
      if (!composingRef.current && el.value !== SENTINEL) armField();
    };

    const onCompositionStart = () => {
      composingRef.current = true;
    };

    const onCompositionEnd = (e: CompositionEvent) => {
      composingRef.current = false;
      emit('insertText', e.data ?? '');
      armField();
    };

    el.addEventListener('beforeinput', onBeforeInput);
    el.addEventListener('input', onInput);
    el.addEventListener('compositionstart', onCompositionStart);
    el.addEventListener('compositionend', onCompositionEnd);

    return () => {
      el.removeEventListener('beforeinput', onBeforeInput);
      el.removeEventListener('input', onInput);
      el.removeEventListener('compositionstart', onCompositionStart);
      el.removeEventListener('compositionend', onCompositionEnd);
    };
  }, []);

  return { onFocus: armField };
}
