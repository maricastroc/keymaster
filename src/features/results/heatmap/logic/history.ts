import { getBuckets } from './buckets';
import { Keystroke } from '@/types/keyStore';
import { getWordRanges } from '@/utils/wordRanges';

export type WordStats = {
  wpm: number;
  word: string;
  hasError: boolean;
  errorCharIndices: Set<number>;
  extras?: string[];
  bucket?: number;
  typedChars?: string;
};

export type HeatmapAnalysis = {
  wordStatsMap: Map<number, WordStats>;
  buckets: number[];
  words: string[];
};

function findWordIndexByCharIndex(charIndex: number, wordRanges: { start: number; end: number }[]) {
  for (let idx = 0; idx < wordRanges.length; idx++) {
    const r = wordRanges[idx];
    if (idx === wordRanges.length - 1) return charIndex >= r.start ? idx : -1;
    if (charIndex >= r.start && charIndex < wordRanges[idx + 1].start) return idx;
  }
  return -1;
}

export function analyzeHeatmap(keystrokes: Keystroke[], text: string): HeatmapAnalysis | null {
  if (!keystrokes || keystrokes.length === 0 || !text) return null;

  const sorted = [...keystrokes]
    .filter((k) => k.typedChar !== 'Backspace')
    .sort((a, b) => a.timestampMs - b.timestampMs);

  const wordRanges = getWordRanges(text);
  const words = wordRanges.map((r) => text.slice(r.start, r.end).replace(/ +$/, ''));

  type WordData = {
    keystrokes: Keystroke[];
    errors: Set<number>;
    extras: string[];
    typedChars: Array<string | null>;
    maxRelIdx: number;
    hasTypingError: boolean;
  };

  const wordData: WordData[] = words.map((word) => ({
    keystrokes: [],
    errors: new Set(),
    extras: [],
    typedChars: new Array(word.length).fill(null),
    maxRelIdx: -1,
    hasTypingError: false,
  }));

  sorted.forEach((k) => {
    const wordIdx = findWordIndexByCharIndex(k.charIndex, wordRanges);
    if (wordIdx === -1) return;

    const data = wordData[wordIdx];
    const range = wordRanges[wordIdx];
    const relIdx = k.charIndex - range.start;
    const isExtra = relIdx >= words[wordIdx].length;

    data.keystrokes.push(k);

    if (!isExtra) {
      data.maxRelIdx = Math.max(data.maxRelIdx, relIdx);
      if (data.typedChars[relIdx] === null) {
        data.typedChars[relIdx] = k.typedChar;
      }
      if (!k.isCorrect) {
        data.errors.add(relIdx);
        data.hasTypingError = true;
      }
    } else {
      const isSpace = relIdx === words[wordIdx].length && k.typedChar === ' ';
      if (!isSpace) {
        data.extras.push(k.typedChar);
        data.hasTypingError = true;
      }
    }
  });

  const wordStatsMap = new Map<number, WordStats>();
  const wordWPMsList: number[] = [];
  let prevWordEndTime = 0;
  let lastTypedWordIdx = -1;

  words.forEach((word, wordIdx) => {
    const data = wordData[wordIdx];
    const { errors, keystrokes: wks, extras, typedChars, hasTypingError } = data;

    const shouldInclude = wks.length > 0 || hasTypingError || extras.length > 0;
    if (!shouldInclude) return;

    const lastKeystroke = wks[wks.length - 1];
    let wpm = 0;
    if (lastKeystroke) {
      const durationMs = Math.max(lastKeystroke.timestampMs - prevWordEndTime, 200);
      prevWordEndTime = lastKeystroke.timestampMs;
      wpm = wks.length / 5 / (durationMs / 60000);
      wordWPMsList.push(wpm);
      lastTypedWordIdx = wordIdx;
    }

    wordStatsMap.set(wordIdx, {
      wpm,
      word,
      hasError: hasTypingError || errors.size > 0,
      errorCharIndices: errors,
      extras: extras.length > 0 ? extras : undefined,
      typedChars: typedChars.map((c) => c ?? '\0').join(''),
    });
  });

  const buckets = getBuckets(wordWPMsList, wordStatsMap) ?? [];
  const displayWords = words.slice(0, lastTypedWordIdx + 4);

  return { wordStatsMap, buckets, words: displayWords };
}
