export type WordRange = { start: number; end: number };

/**
 * Splits `text` into character index ranges, one per space-delimited word.
 * Each range's `end` is exclusive and includes the trailing space (or the
 * final character), so `text.slice(start, end)` yields the word plus its
 * separator. Shared by the results heatmap and replay.
 */
export function getWordRanges(text: string): WordRange[] {
  const ranges: WordRange[] = [];
  if (!text) return ranges;

  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ' || i === text.length - 1) {
      const end = i + 1;
      if (end > start) ranges.push({ start, end });
      start = end;
    }
  }
  return ranges;
}
