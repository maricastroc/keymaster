import { useEffect, useRef, type RefObject } from 'react';

import { keysFromInput } from '@/features/typing/logic/inputEvents';

/**
 * Keeps the capture field non-empty so a backspace always has something to
 * delete — some mobile keyboards skip the delete event entirely on an empty
 * field, which would swallow the user's corrections.
 */
const SENTINEL = ' ';

type Params = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  /** The engine's `handleKeyDown`. */
  onKey: (key: string) => void;
};

/**
 * Bridges a hidden `<textarea>` to the typing engine using `beforeinput` /
 * `compositionend` instead of `keydown`, so the app captures input reliably on
 * mobile soft keyboards (which fire unreliable `keydown` events).
 *
 * The field is fully owned here: every mutation is cancelled and mapped to
 * discrete engine keys, so the textarea itself never accumulates text and the
 * engine stays the single source of truth. Composition (dead-key accents, IME)
 * is handled on `compositionend` so multilingual input lands as whole
 * characters.
 *
 * Returns an `onFocus` handler to spread onto the textarea; it arms the field
 * (sentinel + caret at end) whenever it gains focus.
 */
export function useTypingInput({ inputRef, onKey }: Params) {
  const composingRef = useRef(false);

  // Always call the latest handleKeyDown without re-subscribing the native
  // listeners on every keystroke (its identity changes as engine state does).
  const onKeyRef = useRef(onKey);
  useEffect(() => {
    onKeyRef.current = onKey;
  });

  const armField = () => {
    const el = inputRef.current;
    if (!el) return;
    if (el.value !== SENTINEL) el.value = SENTINEL;
    // Park the caret after the sentinel so a backspace targets it.
    const end = el.value.length;
    try {
      el.setSelectionRange(end, end);
    } catch {
      // setSelectionRange can throw on detached nodes; safe to ignore.
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
      // Let the browser handle composing text in the field; we grab the final
      // result on compositionend.
      if (composingRef.current || e.isComposing) return;
      // We own the field: stop the mutation so the sentinel (and thus reliable
      // mobile backspace) is preserved and the field never grows.
      e.preventDefault();
      emit(e.inputType, e.data);
    };

    // Self-heal: if a browser doesn't honour preventDefault on beforeinput, the
    // field drifts from the sentinel here. Restore it (without re-emitting —
    // setting `.value` fires no input event).
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
    // inputRef is stable; listeners read the latest handler via onKeyRef, so
    // this subscribes once for the field's lifetime.
  }, []);

  return { onFocus: armField };
}
