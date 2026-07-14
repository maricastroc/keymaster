'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

import { useSound } from '@/features/sound/context/SoundContext';
import { useTypingEngine } from '@/features/typing/hooks/useTypingEngine';
import { useTypingInput } from '@/features/typing/hooks/useTypingInput';
import { useAutoFocusOnReady } from '@/features/typing/hooks/useAutoFocusOnReady';
import { WordDisplay } from '@/features/typing/components/WordDisplay';
import { MetricsPanel } from '@/features/typing/components/MetricsPanel';
import { Button } from '@/components/ui/button';
import type { DailyChallengeText } from '@/types/daily';

type SubmitState = 'idle' | 'saving' | 'saved' | 'error';

type Props = {
  text: DailyChallengeText;
  isLoggedIn: boolean;
};

/**
 * Self-contained typing surface for the daily challenge. Reuses the shared
 * engine, input bridge, and metrics — deliberately isolated from the home page
 * so it can't affect the main test. On completion it posts the result to the
 * daily board and refreshes the page's server data to reflect the new ranking.
 */
export function DailyArena({ text, isLoggedIn }: Props) {
  const router = useRouter();
  const { playKeystroke, playErrorSound, preload } = useSound();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const submittedRef = useRef(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [result, setResult] = useState<{ wpm: number; accuracy: number; improved: boolean } | null>(null);

  const submit = useCallback(
    async (wpm: number, accuracy: number) => {
      if (!isLoggedIn || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitState('saving');
      try {
        const res = await fetch('/api/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textId: text.id, wpm, accuracy }),
        });
        if (!res.ok) throw new Error('submit failed');
        const data: { improved: boolean } = await res.json();
        setResult((r) => (r ? { ...r, improved: data.improved } : r));
        setSubmitState('saved');

        router.replace(router.asPath, undefined, { scroll: false });
      } catch {
        setSubmitState('error');
      }
    },
    [isLoggedIn, text.id, router]
  );

  const {
    isStarted,
    activeWordIndex,
    userInput,
    words,
    metrics,
    timeLeft,
    isCompleted,
    isReady,
    prepare,
    handleKeyDown,
    reset,
  } = useTypingEngine(text.content, {
    mode: 'passage',
    onSuccess: playKeystroke,
    onError: playErrorSound,
    onFinished: (stats) => {
      inputRef.current?.blur();
      setResult({ wpm: stats.wpm, accuracy: stats.accuracy, improved: false });
      void submit(stats.wpm, stats.accuracy);
    },
  });

  const { onFocus: onInputFocus } = useTypingInput({ inputRef, onKey: handleKeyDown });
  useAutoFocusOnReady({ isReady, isStarted, inputRef, preload });

  const handleStart = () => {
    if (isReady) return;
    prepare();
    inputRef.current?.focus();
  };

  const handleAgain = () => {
    submittedRef.current = false;
    setSubmitState('idle');
    setResult(null);
    reset(text.content);
    prepare();
    setTimeout(() => inputRef.current?.focus(), 30);
  };

  const progress = words.length > 0 ? activeWordIndex / words.length : 0;

  if (isCompleted && result) {
    return (
      <div className="flex flex-col items-center gap-5 py-10">
        <div className="flex items-end gap-6">
          <div className="flex flex-col items-center">
            <span className="font-mono text-5xl font-bold tabular-nums text-yellow-500">{result.wpm}</span>
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">wpm</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono text-2xl font-bold tabular-nums text-neutral-300">{result.accuracy}%</span>
            <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">accuracy</span>
          </div>
        </div>

        <p className="h-5 font-mono text-xs">
          {!isLoggedIn ? (
            <button onClick={() => signIn('github')} className="text-yellow-500 hover:underline">
              Sign in to save your result to the daily board
            </button>
          ) : submitState === 'saving' ? (
            <span className="text-neutral-500">Saving…</span>
          ) : submitState === 'saved' ? (
            <span className="text-neutral-400">
              {result.improved ? 'Saved — new daily best! 🎉' : 'Saved (kept your best of the day)'}
            </span>
          ) : submitState === 'error' ? (
            <span className="text-red-500">Couldn&apos;t save — try again.</span>
          ) : null}
        </p>

        <Button variant="outline" size="sm" onClick={handleAgain}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <MetricsPanel
        isStarted={isStarted}
        metrics={metrics}
        mode="passage"
        timeLeft={timeLeft}
        progress={progress}
      />

      <div className="relative mt-6">
        <div
          onClick={() => isReady && inputRef.current?.focus()}
          className={`max-h-40 overflow-y-auto scroll-smooth hide-scrollbar font-mono text-2xl leading-relaxed cursor-text transition-opacity duration-300 sm:max-h-48 sm:text-3xl ${
            !isReady ? 'blur-sm opacity-60' : ''
          }`}
        >
          {words.map((word, wordIdx) => (
            <div key={wordIdx} className="inline-block">
              <WordDisplay
                word={word}
                typed={userInput[wordIdx] || ''}
                isCurrent={wordIdx === activeWordIndex}
                isReady={isReady}
                isStarted={isStarted}
              />
            </div>
          ))}
        </div>

        <textarea
          ref={inputRef}
          onFocus={onInputFocus}
          className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-0 text-[16px] opacity-0 caret-transparent outline-none pointer-events-none"
          aria-label="Daily challenge input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
          tabIndex={-1}
        />

        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Button size="lg" onClick={handleStart}>
              Start daily challenge
            </Button>
            <p className="font-mono text-xs text-neutral-500">or click the text and start typing</p>
          </div>
        )}
      </div>
    </div>
  );
}
