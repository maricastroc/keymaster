import { describe, it, expect } from 'vitest';
import { generatePractice, practiceWeight } from './generatePractice';

describe('practiceWeight', () => {
  it('weights every word equally when there are no targets', () => {
    expect(practiceWeight('cat', new Set())).toBe(1);
  });

  it('scales with the number of weak-key letters in the word', () => {
    expect(practiceWeight('pizza', new Set(['z']))).toBe(6); // two z's * 3
    expect(practiceWeight('zoo', new Set(['z']))).toBe(3);
  });

  it('keeps a small non-zero weight for words without any target letter', () => {
    expect(practiceWeight('dog', new Set(['z']))).toBe(0.15);
  });
});

describe('generatePractice', () => {
  const bank = ['zoo', 'cat', 'pizza', 'dog', 'quiz', 'run'];

  it('returns an empty string for an empty bank', () => {
    expect(generatePractice(['z'], [])).toBe('');
  });

  it('produces the requested number of words, all from the bank', () => {
    const text = generatePractice(['z'], bank, { words: 10, random: cyclicRandom() });
    const produced = text.split(' ');
    expect(produced).toHaveLength(10);
    for (const w of produced) expect(bank).toContain(w);
  });

  it('never repeats a word back-to-back when the bank allows it', () => {
    const produced = generatePractice(['z'], bank, { words: 20, random: cyclicRandom() }).split(' ');
    for (let i = 1; i < produced.length; i++) {
      expect(produced[i]).not.toBe(produced[i - 1]);
    }
  });

  it('favors words containing the weak keys', () => {
    // With a heavy bias toward 'z', z-words should dominate over the long run.
    const produced = generatePractice(['z'], bank, { words: 200, random: Math.random }).split(' ');
    const zWords = produced.filter((w) => w.includes('z')).length;
    expect(zWords).toBeGreaterThan(produced.length / 2);
  });
});

// Deterministic RNG cycling through fixed fractions, to exercise selection
// without depending on Math.random.
function cyclicRandom() {
  const seq = [0.05, 0.27, 0.51, 0.73, 0.92, 0.4];
  let i = 0;
  return () => seq[i++ % seq.length];
}
