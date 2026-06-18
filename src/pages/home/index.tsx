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

  const [showHistorySection, setShowHistorySection] = useState(false);

  const [currentText, setCurrentText] = useState('');
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const wordsRef = useRef<(HTMLDivElement | null)[]>([]);

  const isRandomizingRef = useRef(false);
  const skipNextSWREffectRef = useRef(false);

  const requestConfig = useMemo(() => {
    if (isRandomizingRef.current) return null;

    return {
      url: '/texts/random',
      method: 'GET',
      params: { category, difficulty },
    };
  }, [category, difficulty]);

  const { data, isValidating } = useRequest<TextResponse>(
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

    isRandomizingRef.current = false;
  };
  const onNextText = async () => {
    setIsNextLoading(true);

    const response = await api.get<TextResponse>('/texts/random', {
      params: { category, difficulty, excludeId: currentTextId },
    });

    if (response.data?.content) {
      setCurrentText(response.data.content);
      setCurrentTextId(response.data.id ?? null);
      reset(response.data.content);
      prepare();
    }

    setIsNextLoading(false);
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
    prepare();
    inputRef.current?.focus();
  };

  const onRestart = () => {
    reset(currentText);
    if (isReady) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const generalStats = useMemo(
    () => calculateGeneralStats(keystrokes, chartData, totalTime),
    [keystrokes, chartData, totalTime]
  );

  useEffect(() => {
    if (!data?.content) return;

    if (skipNextSWREffectRef.current) {
      skipNextSWREffectRef.current = false;
      return;
    }

    setCurrentText(data.content);
    setCurrentTextId(data.id ?? null);
    reset(data.content);
  }, [data]);

  useEffect(() => {
    if (!currentText) return;
    reset(currentText);
  }, [initialTime]);

  useEffect(() => {
    if (!isReady) return;

    const currentWordEl = wordsRef.current[activeWordIndex];

    currentWordEl?.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
      <div className="w-full max-w-5xl">
        <Header
          onOpenHistorySection={() => setShowHistorySection(true)}
        />

        <Dialog.Root open={showHistorySection} onOpenChange={setShowHistorySection}>
          <HistorySection open={showHistorySection} onOpenChange={setShowHistorySection} />
        </Dialog.Root>

        {showResults && (
          <div className="animate-resultIn">
            <ResultSection
              metrics={metrics}
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

        <div className="mt-6 relative">
          {!showResults && !currentText && (
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
          {!showResults && currentText && (
            <div
              onClick={() => isReady && inputRef.current?.focus()}
              className={`max-h-40 sm:max-h-44 overflow-y-auto scroll-smooth hide-scrollbar font-mono text-2xl sm:text-3xl leading-relaxed cursor-text transition-opacity duration-300 ${
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

        <ActionButtons
          onRandomize={onRandomize}
          onRestart={onRestart}
          onNext={onNextText}
          isLoading={isLoading}
          loadingButton={loadingButton}
        />

      </div>
    </div>
  );
}
