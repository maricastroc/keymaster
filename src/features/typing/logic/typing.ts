import type { Keystroke } from '@/types/keyStore';

export function canAdvanceWord(
  typed: string,
  activeWordIndex: number,
  totalWords: number
): boolean {
  return typed.length > 0 && activeWordIndex < totalWords - 1;
}

export function isLastWordComplete(
  activeWordIndex: number,
  words: string[],
  userInput: string[]
): boolean {
  if (activeWordIndex !== words.length - 1) return false;
  const typed = userInput[activeWordIndex] ?? '';
  const word = words[activeWordIndex];
  return typed.length >= word.length;
}

// How far a word may overflow past its own length before further input is
// rejected. Enough to see a short mistyped run, but tight enough that a word
// can't balloon into a long red blob that reflows the rest of the text.
export const MAX_WORD_OVERFLOW = 5;

export function canTypeMoreChars(typed: string, word: string): boolean {
  return typed.length < word.length + MAX_WORD_OVERFLOW;
}

export function calculateMetrics(
  keystrokes: Keystroke[],
  elapsedSeconds: number
): { wpm: number; accuracy: number } {
  if (keystrokes.length === 0) return { wpm: 0, accuracy: 100 };

  const valid = keystrokes.filter((k) => k.typedChar !== 'Backspace');
  const totalTyped = valid.length;
  const totalCorrect = valid.filter((k) => k.isCorrect).length;

  const minutes = Math.max(0.01, elapsedSeconds / 60);
  const wpm = Math.round(totalCorrect / 5 / minutes);
  const accuracy = totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;

  return { wpm, accuracy };
}
