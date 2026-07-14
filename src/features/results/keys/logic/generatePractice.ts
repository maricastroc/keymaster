/**
 * Synthesize a practice passage that emphasizes a set of weak keys, by picking
 * words from a bank weighted toward how many weak-key letters they contain.
 * Pure and deterministic when a `random` source is injected, so it's testable.
 */

export type PracticeOptions = {
  /** How many words the drill should contain. */
  words?: number;
  /** Injectable RNG for deterministic tests; defaults to `Math.random`. */
  random?: () => number;
};

/**
 * Weight a word for inclusion. Words containing weak keys are strongly favored
 * (proportional to how many weak-key letters they hold); words with none keep a
 * small non-zero weight so the passage still reads like real text.
 */
export function practiceWeight(word: string, targets: Set<string>): number {
  if (targets.size === 0) return 1;
  let hits = 0;
  for (const ch of word) {
    if (targets.has(ch)) hits += 1;
  }
  return hits > 0 ? hits * 3 : 0.15;
}

export function generatePractice(
  weakKeys: string[],
  wordBank: string[],
  options: PracticeOptions = {},
): string {
  const { words = 45, random = Math.random } = options;
  if (wordBank.length === 0) return '';

  const targets = new Set(weakKeys.map((k) => k.toLowerCase()).filter((k) => /^[a-z]$/.test(k)));

  const weighted = wordBank.map((w) => ({ word: w, weight: practiceWeight(w, targets) }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return '';

  const pickOne = () => {
    let r = random() * total;
    for (const item of weighted) {
      r -= item.weight;
      if (r <= 0) return item.word;
    }
    return weighted[weighted.length - 1].word;
  };

  const out: string[] = [];
  let last = '';

  let attempts = 0;
  const maxAttempts = words * 20;
  while (out.length < words && attempts < maxAttempts) {
    attempts += 1;
    const picked = pickOne();
    if (picked === last && wordBank.length > 1) continue;
    out.push(picked);
    last = picked;
  }

  return out.join(' ');
}
