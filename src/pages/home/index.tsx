'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as Dialog from '@radix-ui/react-dialog';

import { useSound } from '@/features/sound/context/SoundContext';
import { useConfig } from '@/features/settings/context/ConfigContext';
import { useTypingEngine } from '@/features/typing/hooks/useTypingEngine';
import { useTextLoader } from '@/features/typing/hooks/useTextLoader';
import { useRoundStats } from '@/features/typing/hooks/useRoundStats';
import { usePersonalBest } from '@/features/typing/hooks/usePersonalBest';
import { useAutoPause } from '@/features/typing/hooks/useAutoPause';
import { useTypingShortcuts } from '@/features/typing/hooks/useTypingShortcuts';
import { useActiveWordScroll } from '@/features/typing/hooks/useActiveWordScroll';
import { useAutoFocusOnReady } from '@/features/typing/hooks/useAutoFocusOnReady';
import { useEngineReset } from '@/features/typing/hooks/useEngineReset';
import { useResultsReveal } from '@/features/typing/hooks/useResultsReveal';
import { useShakeOnBump } from '@/features/typing/hooks/useShakeOnBump';
import { useResumeOnKey } from '@/features/typing/hooks/useResumeOnKey';
import { useKeyProfile } from '@/features/results/keys/useKeyProfile';
import { generatePractice } from '@/features/results/keys/logic/generatePractice';
import { practiceWords } from '@/data/practiceWords';
import { calculateGeneralStats } from '@/utils/calculateStats';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OnboardingHint } from '@/components/OnboardingHint';
import { Button } from '@/components/ui/button';
import { InlineSettings } from '@/features/settings/components/InlineSettings';
import { ActionButtons } from '@/features/typing/components/ActionButtons';
import { WordDisplay } from '@/features/typing/components/WordDisplay';
import { PauseWarning } from '@/features/typing/components/PauseWarning';
import { MetricsPanel } from '@/features/typing/components/MetricsPanel';
import { CustomTextModal } from '@/features/typing/components/CustomTextModal';
import { HistorySection } from '@/features/results/components/HistorySection';

const ResultSection = dynamic(
  () => import('@/features/results/components/ResultSection').then((m) => m.ResultSection),
  {
    ssr: false,
    loading: () => (
      <div className="mt-8 text-center font-mono text-sm text-neutral-500">Loading results…</div>
    ),
  }
);

export default function Home() {
  const { playKeystroke, playErrorSound, preload } = useSound();

  const { initialTime, practice, setPractice } = useConfig();

  const { saveRound } = useRoundStats();

  const { recordRound, weakKeys } = useKeyProfile();

  const personalBest = usePersonalBest();
  const personalBestRef = useRef(0);
  const [isNewBest, setIsNewBest] = useState(false);

  const [showHistorySection, setShowHistorySection] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const wordsContainerRef = useRef<HTMLDivElement>(null);

  const hasInteractedRef = useRef(false);

  const makeDrill = () => generatePractice(weakKeys.map((k) => k.key), practiceWords);

  const {
    currentText,
    isNextLoading,
    isValidating,
    error,
    loadError,
    randomize,
    next: loadNextText,
    setCustomText,
    retry,
  } = useTextLoader(hasInteractedRef, practice, makeDrill);

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
    overflowBump,
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
      if (stats) {
        setIsNewBest(stats.wpm > personalBestRef.current);
        saveRound(stats);
      }
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

  const handleCustomText = (text: string) => {
    setShowCustomModal(false);

    setCustomText(text);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const handlePracticeWeakKeys = () => {
    hasInteractedRef.current = true;
    if (practice) loadNextText();
    else setPractice(true);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const generalStats = useMemo(
    () => calculateGeneralStats(keystrokes, chartData, totalTime),
    [keystrokes, chartData, totalTime]
  );

  useEngineReset({ currentText, initialTime, hasInteractedRef, reset, prepare });

  useActiveWordScroll({
    activeWordIndex,
    isStarted,
    isReady,
    containerRef: wordsContainerRef,
  });

  useAutoFocusOnReady({ isReady, isStarted, inputRef, preload });

  // Prefetch the (lazy) results chunk once typing begins, so it's ready by the
  // time the round completes.
  useEffect(() => {
    if (isStarted) import('@/features/results/components/ResultSection');
  }, [isStarted]);

  useAutoPause({ isStarted, isCompleted, isPaused, pause });

  const capsLockOn = useTypingShortcuts({
    currentText,
    blocked: showHistorySection,
    onRestart,
  });

  const isLoading = isValidating || isNextLoading;
  const loadingButton = isNextLoading ? 'next' : isValidating ? 'randomize' : null;
  const hasLoadError = !!error || !!loadError;

  const srStatus = isCompleted
    ? `Test complete. ${metrics.wpm} words per minute, ${metrics.accuracy} percent accuracy.`
    : isPaused
      ? 'Test paused.'
      : '';

  useEffect(() => {
    personalBestRef.current = personalBest;
  }, [personalBest]);

  const { showResults, textFading } = useResultsReveal(isCompleted, setIsNewBest);

  // Nudge the current word when the user keeps typing past the overflow cap.
  const isOverflowShaking = useShakeOnBump(overflowBump);

  const handleResume = useCallback(() => {
    resume();
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [resume]);

  // Paused runs resume on click (the overlay button) or on any real keypress.
  useResumeOnKey(isPaused, handleResume);

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-6 md:py-10">
      <a
        href="#typing-area"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-yellow-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to typing test
      </a>
      <div className="w-full max-w-5xl flex flex-1 flex-col">
        <Header
          onOpenHistorySection={() => setShowHistorySection(true)}
        />

        <div role="status" aria-live="polite" className="sr-only">
          {srStatus}
        </div>

        {!showResults && !isStarted && <OnboardingHint />}

        <Dialog.Root open={showHistorySection} onOpenChange={setShowHistorySection}>
          <HistorySection open={showHistorySection} onOpenChange={setShowHistorySection} />
        </Dialog.Root>

        <CustomTextModal
          open={showCustomModal}
          onOpenChange={setShowCustomModal}
          onSubmit={handleCustomText}
        />

        {showResults && (
          <div className="animate-resultIn">
            <ResultSection
              finishedTime={finishedTime}
              chartData={chartData}
              generalStats={generalStats}
              keystrokes={keystrokes}
              text={currentText}
              isNewBest={isNewBest}
              accumulatedWeak={weakKeys}
              onRecordRound={recordRound}
              onPracticeWeakKeys={handlePracticeWeakKeys}
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

        {capsLockOn && !showResults && (
          <div className="mt-4 flex justify-center" role="status">
            <span className="flex items-center gap-1.5 rounded-md bg-neutral-800 px-2.5 py-1 font-mono text-xs text-yellow-500">
              <span aria-hidden>⇪</span> Caps Lock is on
            </span>
          </div>
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
              <Button variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            </div>
          )}
          {!showResults && currentText && (
            <div
              ref={wordsContainerRef}
              onClick={() => isReady && inputRef.current?.focus()}
              className={`max-h-40 sm:max-h-48 overflow-y-auto scroll-smooth hide-scrollbar font-mono text-2xl sm:text-3xl leading-relaxed cursor-text transition-opacity duration-300 ${
                !isReady || isPaused || isLoading ? 'blur-sm opacity-60' : ''
              } ${textFading ? 'opacity-0' : ''}`}
            >
              {words.map((word, wordIdx) => (
                <div
                  key={wordIdx}
                  data-word-index={wordIdx}
                  className={`inline-block ${
                    isOverflowShaking && wordIdx === activeWordIndex ? 'animate-shake' : ''
                  }`}
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

          {isPaused && <PauseWarning onResume={handleResume} />}

          {!isReady && !isCompleted && !isPaused && currentText && (
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

        {!showResults && (
          <div className="-mt-3 mb-4 flex justify-center">
            <button
              onClick={() => setShowCustomModal(true)}
              className="cursor-pointer font-mono text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              paste your own text
            </button>
          </div>
        )}

        {loadError && currentText && !showResults && (
          <p role="alert" className="mt-4 text-center font-mono text-xs text-red-500">
            {loadError}
          </p>
        )}

        <ActionButtons
          onRandomize={randomize}
          onRestart={onRestart}
          onNext={loadNextText}
          isLoading={isLoading}
          loadingButton={loadingButton}
        />

        {currentText && !showResults && (
          <p className="mt-3 text-center font-mono text-[11px] text-neutral-500">
            press <span className="text-neutral-300">Esc</span> to restart
          </p>
        )}

        <Footer />
      </div>
    </div>
  );
}
