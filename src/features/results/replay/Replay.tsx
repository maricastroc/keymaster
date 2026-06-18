import { useMemo } from 'react';
import { Keystroke } from '@/types/keyStore';
import { useReplay } from './useReplay';

type Props = {
  keystrokes: Keystroke[];
  text: string;
  onKeystroke?: () => void;
};

type CharState = 'untyped' | 'correct' | 'incorrect' | 'cursor';

function buildWordRanges(text: string) {
  const ranges: { start: number; end: number }[] = [];
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

function buildCharStates(
  text: string,
  keystrokes: Keystroke[],
  upToIndex: number,
): { state: CharState; typed: string }[] {
  const states: { state: CharState; typed: string }[] = text
    .split('')
    .map(() => ({ state: 'untyped', typed: '' }));

  let lastCharIndex = -1;

  for (let i = 0; i < upToIndex && i < keystrokes.length; i++) {
    const k = keystrokes[i];
    if (k.charIndex < states.length) {
      states[k.charIndex] = {
        state: k.isCorrect ? 'correct' : 'incorrect',
        typed: k.typedChar,
      };
      lastCharIndex = k.charIndex;
    }
  }

  const cursorPos = upToIndex > 0 && lastCharIndex + 1 < states.length
    ? lastCharIndex + 1
    : -1;

  if (cursorPos >= 0 && states[cursorPos].state === 'untyped') {
    states[cursorPos] = { state: 'cursor', typed: '' };
  }

  return states;
}

export const Replay = ({ keystrokes, text, onKeystroke }: Props) => {
  const { isPlaying, play, pause, reset, currentIndex, jumpToIndex } = useReplay({
    keystrokes,
    onKeystroke,
  });

  const wordRanges = useMemo(() => buildWordRanges(text), [text]);

  const fillPercent = keystrokes.length > 0 ? (currentIndex / keystrokes.length) * 100 : 0;

  const charStates = useMemo(
    () => buildCharStates(text, keystrokes, currentIndex),
    [text, keystrokes, currentIndex],
  );

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-neutral-400 font-semibold text-sm uppercase tracking-widest">
          Replay
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="cursor-pointer text-xs text-neutral-500 hover:text-neutral-300 transition"
            title="Reset"
          >
            ↩
          </button>
          <button
            onClick={isPlaying ? pause : play}
            className="cursor-pointer text-xs px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 transition"
          >
            {isPlaying ? 'Pause' : currentIndex >= keystrokes.length ? 'Replay' : 'Play'}
          </button>
        </div>
      </div>

      <div className="relative w-full h-1">
        <div className="absolute inset-0 rounded-full bg-neutral-700" />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-yellow-500"
          style={{ width: `${fillPercent}%` }}
        />
        <input
          type="range"
          min={0}
          max={keystrokes.length}
          value={currentIndex}
          onChange={(e) => { pause(); jumpToIndex(Number(e.target.value)); }}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="font-mono leading-loose text-base select-none">
        {wordRanges.map((range, wordIdx) => {
          const word = text.slice(range.start, range.end).replace(/ $/, '');
          return (
            <span key={wordIdx} className="inline-block mr-2">
              {word.split('').map((char, relIdx) => {
                const absIdx = range.start + relIdx;
                const cs = charStates[absIdx];
                let color = 'text-neutral-300';
                if (cs.state === 'correct') color = 'text-neutral-400';
                if (cs.state === 'incorrect') color = 'text-red-400';
                if (cs.state === 'cursor') color = 'text-neutral-300 border-b-2 border-blue-400';
                return (
                  <span key={relIdx} className={color}>
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>

      <div className="text-xs text-neutral-600 text-right">
        {currentIndex} / {keystrokes.length} keystrokes
      </div>
    </div>
  );
};
