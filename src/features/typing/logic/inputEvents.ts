/**
 * Translates a native `beforeinput`/`compositionend` event into the discrete
 * key strings the typing engine understands (`handleKeyDown`).
 *
 * Driving the engine from `InputEvent` rather than `keydown` is what makes the
 * app work on mobile: soft keyboards fire unreliable `keydown` events (Android
 * commonly reports `keyCode 229` / `key: "Unidentified"`), but they emit proper
 * `beforeinput` events with a real `inputType` and `data` payload.
 */
export function keysFromInput(inputType: string, data: string | null): string[] {
  // Any insertion (`insertText`, `insertFromPaste`, `insertReplacementText`, …)
  // carries the inserted text in `data`. A single tap is one char; swipe/paste
  // may carry several. Spaces flow through as ' ' and become word advances.
  // `insertLineBreak`/`insertParagraph` (Enter) carry no data → no keys.
  if (inputType.startsWith('insert')) {
    return data ? Array.from(data) : [];
  }

  // Backward deletions map to Backspace; forward deletes (Del key) have no
  // engine equivalent and are ignored.
  if (inputType.startsWith('delete')) {
    return inputType.includes('Forward') ? [] : ['Backspace'];
  }

  return [];
}
