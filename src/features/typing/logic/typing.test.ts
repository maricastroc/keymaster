import { describe, it, expect } from 'vitest';
import {
  canAdvanceWord,
  isLastWordComplete,
  canTypeMoreChars,
  calculateMetrics,
} from './typing';

describe('canAdvanceWord', () => {
  it('returns true when typed has chars and not on last word', () => {
    expect(canAdvanceWord('hello', 0, 3)).toBe(true);
  });

  it('returns false when typed is empty', () => {
    expect(canAdvanceWord('', 0, 3)).toBe(false);
  });

  it('returns false when on last word', () => {
    expect(canAdvanceWord('hello', 2, 3)).toBe(false);
  });
});

describe('isLastWordComplete', () => {
  const words = ['hello', 'world'];

  it('returns true when last word is fully typed', () => {
    expect(isLastWordComplete(1, words, ['hello', 'world'])).toBe(true);
  });

  it('returns false when last word is partially typed', () => {
    expect(isLastWordComplete(1, words, ['hello', 'wor'])).toBe(false);
  });

  it('returns false when not on last word', () => {
    expect(isLastWordComplete(0, words, ['hello', ''])).toBe(false);
  });
});

describe('canTypeMoreChars', () => {
  it('returns true when typed is shorter than word length + 5', () => {
    // 'hello' (5) + 4 extra chars = 9, still under the cap of 10.
    expect(canTypeMoreChars('helloextr', 'hello')).toBe(true);
  });

  it('returns false when typed reaches word length + 5', () => {
    // 'hello' (5) + 5 extra chars = 10, exactly at the cap.
    expect(canTypeMoreChars('helloextra', 'hello')).toBe(false);
  });

  it('returns true when typed is empty', () => {
    expect(canTypeMoreChars('', 'word')).toBe(true);
  });
});

describe('calculateMetrics', () => {
  it('returns zeros when keystrokes is empty', () => {
    expect(calculateMetrics([], 10)).toEqual({ wpm: 0, accuracy: 100 });
  });

  it('calculates wpm and accuracy correctly', () => {
    const keystrokes = [
      { charIndex: 0, expectedChar: 'h', typedChar: 'h', isCorrect: true, timestampMs: 1000 },
      { charIndex: 1, expectedChar: 'e', typedChar: 'e', isCorrect: true, timestampMs: 2000 },
      { charIndex: 2, expectedChar: 'l', typedChar: 'l', isCorrect: true, timestampMs: 3000 },
      { charIndex: 3, expectedChar: 'l', typedChar: 'l', isCorrect: true, timestampMs: 4000 },
      { charIndex: 4, expectedChar: 'o', typedChar: 'o', isCorrect: true, timestampMs: 5000 },
      { charIndex: 5, expectedChar: 'w', typedChar: 'x', isCorrect: false, timestampMs: 6000 },
    ];
    const result = calculateMetrics(keystrokes, 60);
    expect(result.wpm).toBe(1);
    expect(result.accuracy).toBe(83);
  });

  it('ignores Backspace keystrokes in accuracy', () => {
    const keystrokes = [
      { charIndex: 0, expectedChar: 'a', typedChar: 'a', isCorrect: true, timestampMs: 1000 },
      { charIndex: 0, expectedChar: 'a', typedChar: 'Backspace', isCorrect: false, timestampMs: 2000 },
    ];
    const result = calculateMetrics(keystrokes, 60);
    expect(result.accuracy).toBe(100);
  });
});
