'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { useSound } from '@/features/sound/context/SoundContext';
import { useConfig } from '@/features/settings/context/ConfigContext';
import { useTypingEngine } from '@/features/typing/hooks/useTypingEngine';
import useRequest from '@/features/typing/hooks/useRequest';
import { useRoundStats } from '@/features/typing/hooks/useRoundStats';
import { calculateGeneralStats } from '@/utils/calculateStats';
import { TextResponse } from '@/types/textResponse';
import { api } from '@/lib/axios';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { InlineSettings } from '@/features/settings/components/InlineSettings';
import { ActionButtons } from '@/features/typing/components/ActionButtons';
import { WordDisplay } from '@/features/typing/components/WordDisplay';
import { PauseWarning } from '@/features/typing/components/PauseWarning';
import { MetricsPanel } from '@/features/typing/components/MetricsPanel';
import { ResultSection } from '@/features/results/components/ResultSection';
import { HistorySection } from '@/features/results/components/HistorySection';
export default function Home() {
  const { playKeystroke, playErrorSound } = useSound();

  const { category, setCategory, difficulty, initialTime } = useConfig();

  const { saveRound } = useRoundStats();

  const [isNextLoading, setIsNextLoading] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [showHistorySection, setShowHistorySection] = useState(false);

  const [currentText, setCurrentText] = useState('');
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const wordsRef = useRef<(HTMLDivElement | null)[]>([]);

  const isRandomizingRef = useRef(false);
  const skipNextSWREffectRef = useRef(false);
  // Once the user has engaged with the test at least once, settings-driven text
  // reloads should land ready-to-type instead of showing the Start overlay
  // again. Stays false on the very first load so the initial overlay still shows.
  const hasInteractedRef = useRef(false);

  const requestConfig = useMemo(() => {
    if (isRandomizingRef.current) return null;

    return {
      url: '/texts/random',
      method: 'GET',
      params: { category, difficulty },
    };
  }, [category, difficulty]);

  const { data, isValidating, error, mutate } = useRequest<TextResponse>(
    requestConfig,
    {
      revalidateOnMount: true,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const onRandomize = async () => {
    isRandomizingRef.current = true;
    hasInteractedRef.current = true;
    setLoadError(null);

    try {
      const response = await api.get<TextResponse>('/texts/random', {
        params: { category: 'any', difficulty, excludeId: currentTextId },
      });

      if (response.data) {
        skipNextSWREffectRef.current = true;
        setCategory(response.data.category);
        setCurrentText(response.data.content);
        setCurrentTextId(response.data.id);
        reset(response.data.content);
        prepare();
      }
    } catch {
      setLoadError('Could not load a new text. Please try again.');
    } finally {
      // Must always reset: while true, requestConfig stays null and SWR is
      // permanently disabled, so leaving it set on error would freeze loading.
      isRandomizingRef.current = false;
    }
  };
  const onNextText = async () => {
    setIsNextLoading(true);
    setLoadError(null);
    hasInteractedRef.current = true;

    // The API returns 404 (axios rejects) when a filter bucket is empty, so
    // treat any failure as "no text here".
    const fetchText = async (cat: string) => {
      try {
        const res = await api.get<TextResponse>('/texts/random', {
          params: { category: cat, difficulty, excludeId: currentTextId },
        });
        return res.data?.content ? res.data : null;
      } catch {
        return null;
      }
    };

    try {
      // Prefer another text in the current category; if that bucket is
      // exhausted at this difficulty, fall back to any category so "Next"
      // never silently dead-ends.
      let next = await fetchText(category);
      if (!next) next = await fetchText('any');

      if (next) {
        if (next.category && next.category !== category) {
          skipNextSWREffectRef.current = true;
          setCategory(next.category);
        }
        setCurrentText(next.content);
        setCurrentTextId(next.id ?? null);
        reset(next.content);
        prepare();
      } else {
        setLoadError('No other texts available for these settings.');
      }
    } finally {
      setIsNextLoading(false);
    }
  };

  const {
    isStarted,
    isPaused,
    activeWordIndex,
    userInput,
    words,
    timeLeft,
    mode,
    metrics,
    chartData,
    isCompleted,
    keystrokes,
    totalTime,
    finishedTime,
    isReady,
    prepare,
    resume,
    handleKeyDown,
    reset,
    pause,
  } = useTypingEngine(currentText, {
    onError: playErrorSound,
    onSuccess: playKeystroke,
    onFinished: (stats) => {
      inputRef.current?.blur();
      if (stats) saveRound(stats);
    },
    initialTime,
  });

  const handlePrepare = () => {
    if (isReady) return;
    hasInteractedRef.current = true;
    prepare();
    inputRef.current?.focus();
  };

  const onRestart = () => {
    hasInteractedRef.current = true;
    reset(currentText);
    prepare();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const generalStats = useMemo(
    () => calculateGeneralStats(keystrokes, chartData, totalTime),
    [keystrokes, chartData, totalTime]
  );

  useEffect(() => {
    if (!data?.content) return;

    setLoadError(null);

    if (skipNextSWREffectRef.current) {
      skipNextSWREffectRef.current = false;
      return;
    }

    setCurrentText(data.content);
    setCurrentTextId(data.id ?? null);
    reset(data.content);
    // Keep the user ready to type after a category/difficulty change; the very
    // first load leaves hasInteractedRef false so the Start overlay still shows.
    if (hasInteractedRef.current) prepare();
  }, [data]);

  const handleRetryLoad = () => {
    setLoadError(null);
    mutate();
  };

  useEffect(() => {
    if (!currentText) return;
    reset(currentText);
    // Changing the timer duration shouldn't bounce the user back to the Start
    // overlay if they've already been typing.
    if (hasInteractedRef.current) prepare();
  }, [initialTime]);

  useEffect(() => {
    if (!isReady) return;

    const currentWordEl = wordsRef.current[activeWordIndex];

    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    currentWordEl?.scrollIntoView({
      block: 'center',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [activeWordIndex, isStarted, isReady]);


  useEffect(() => {
    if (isReady && !isStarted) {
      inputRef.current?.focus();
    }
  }, [isReady, isStarted]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStarted && !isCompleted && !isPaused) {
        pause();
      }
    };

    const handleBlur = () => {
      if (isStarted && !isCompleted && !isPaused) {
        pause();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isStarted, isCompleted, isPaused, pause]);

  const isLoading = isValidating || isNextLoading;
  const loadingButton = isNextLoading ? 'next' : isValidating ? 'randomize' : null;
  const hasLoadError = !!error || !!loadError;

  // Announced to screen readers via an aria-live region, since the typing UI
  // itself is visual-only.
  const srStatus = isCompleted
    ? `Test complete. ${metrics.wpm} words per minute, ${metrics.accuracy} percent accuracy.`
    : isPaused
      ? 'Test paused.'
      : '';

  const [showResults, setShowResults] = useState(false);
  const [textFading, setTextFading] = useState(false);

  useEffect(() => {
    if (!isCompleted) {
      setShowResults(false);
      setTextFading(false);
      return;
    }
    setTextFading(true);
    const t = setTimeout(() => setShowResults(true), 350);
    return () => clearTimeout(t);
  }, [isCompleted]);


  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-6 md:py-10">
      <a
        href="#typing-area"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-yellow-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to typing test
      </a>
      <div className="w-full max-w-5xl">
        <Header
          onOpenHistorySection={() => setShowHistorySection(true)}
        />

        <div role="status" aria-live="polite" className="sr-only">
          {srStatus}
        </div>

        <Dialog.Root open={showHistorySection} onOpenChange={setShowHistorySection}>
          <HistorySection open={showHistorySection} onOpenChange={setShowHistorySection} />
        </Dialog.Root>

        {showResults && (
          <div className="animate-resultIn">
            <ResultSection
              finishedTime={finishedTime}
              chartData={chartData}
              generalStats={generalStats}
              keystrokes={keystrokes}
              text={currentText}
            />
          </div>
        )}

        {!showResults && (
          <MetricsPanel
            isStarted={isStarted}
            metrics={metrics}
            mode={mode}
            timeLeft={timeLeft}
            progress={words.length > 0 ? activeWordIndex / words.length : 0}
          />
        )}

        <div id="typing-area" tabIndex={-1} className="mt-6 relative outline-none">
          {!showResults && !currentText && !hasLoadError && (
            <div className="flex flex-col gap-4 py-2">
              {[85, 65, 75, 50, 70].map((w, i) => (
                <div
                  key={i}
                  className="h-8 rounded-lg bg-neutral-800 animate-pulse"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          )}
          {!showResults && !currentText && hasLoadError && (
            <div
              role="alert"
              className="flex flex-col items-center justify-center gap-3 py-12 text-center"
            >
              <p className="font-mono text-sm text-red-500">Couldn&apos;t load a text.</p>
              <p className="text-preset-7 text-neutral-500 max-w-xs">
                {loadError ?? 'Check your connection and try again.'}
              </p>
              <Button variant="outline" size="sm" onClick={handleRetryLoad}>
                Try again
              </Button>
            </div>
          )}
          {!showResults && currentText && (
            <div
              onClick={() => isReady && inputRef.current?.focus()}
              className={`max-h-40 sm:max-h-48 overflow-y-auto scroll-smooth hide-scrollbar font-mono text-2xl sm:text-3xl leading-relaxed cursor-text transition-opacity duration-300 ${
                !isReady || isPaused || isLoading ? 'blur-sm opacity-60' : ''
              } ${textFading ? 'opacity-0' : ''}`}
            >
              {words.map((word, wordIdx) => (
                <div
                  key={wordIdx}
                  ref={(el) => { wordsRef.current[wordIdx] = el; }}
                  className="inline-block"
                >
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
          )}

          <input
            ref={inputRef}
            className="absolute opacity-0 pointer-events-none"
            autoComplete="off"
            aria-label="Typing test input"
            onKeyDown={(e) => handleKeyDown(e.key)}
          />

          {isPaused && (
            <PauseWarning
              onResume={() => {
                resume();
                setTimeout(() => inputRef.current?.focus(), 10);
              }}
            />
          )}

          {!isReady && !isCompleted && !isPaused && (
            <div
              onClick={handlePrepare}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-lg"
            >
              <Button size="lg" onClick={handlePrepare}>
                Start Typing Test
              </Button>
              <p className="text-preset-5-semibold mt-4 text-neutral-400">
                Or click the text and start typing
              </p>
            </div>
          )}
        </div>

        {!showResults && (
          <InlineSettings onPrepare={() => prepare()} />
        )}

        {loadError && currentText && !showResults && (
          <p role="alert" className="mt-4 text-center font-mono text-xs text-red-500">
            {loadError}
          </p>
        )}

        <ActionButtons
          onRandomize={onRandomize}
          onRestart={onRestart}
          onNext={onNextText}
          isLoading={isLoading}
          loadingButton={loadingButton}
        />

        <Footer />
      </div>
    </div>
  );
}
