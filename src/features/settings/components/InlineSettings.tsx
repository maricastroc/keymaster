'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye, faSliders } from '@fortawesome/free-solid-svg-icons';

import { useConfig, type Language } from '@/features/settings/context/ConfigContext';
import { Pills, type PillOption } from '@/components/ui/pills';

type InlineSettingsProps = {
  onPrepare: () => void;
};

type Category = 'general' | 'lyrics' | 'quotes' | 'code';
type Difficulty = 'easy' | 'medium' | 'hard';

const MODE_OPTIONS: PillOption<string>[] = [
  { label: '15s', value: '15' },
  { label: '30s', value: '30' },
  { label: '60s', value: '60' },
  { label: '120s', value: '120' },
  { label: 'passage', value: 'passage' },
];

const DIFFICULTY_OPTIONS: PillOption<Difficulty>[] = [
  { label: 'easy', value: 'easy' },
  { label: 'medium', value: 'medium' },
  { label: 'hard', value: 'hard' },
];

const CATEGORY_OPTIONS: PillOption<Category>[] = [
  { label: 'general', value: 'general' },
  { label: 'lyrics', value: 'lyrics' },
  { label: 'quotes', value: 'quotes' },
  { label: 'code', value: 'code' },
];

const LANGUAGE_OPTIONS: PillOption<Language>[] = [
  { label: 'en', value: 'en' },
  { label: 'pt', value: 'pt' },
  { label: 'es', value: 'es' },
  { label: 'fr', value: 'fr' },
  { label: 'de', value: 'de' },
];

const Separator = () => (
  <span className="text-neutral-700 text-sm select-none hidden sm:inline">|</span>
);

export const InlineSettings = ({ onPrepare }: InlineSettingsProps) => {
  const {
    mode,
    setMode,
    category,
    setCategory,
    difficulty,
    setDifficulty,
    language,
    setLanguage,
    initialTime,
    setInitialTime,
    practice,
    setPractice,
  } = useConfig();

  const [showMore, setShowMore] = useState(false);

  const currentModeValue = mode === 'passage' ? 'passage' : String(initialTime);

  const handleModeChange = (value: string) => {
    if (value === 'passage') {
      setMode('passage');
    } else {
      setMode('timed');
      setInitialTime(Number(value));
    }
    onPrepare();
  };

  const handleCategoryChange = (value: Category) => {
    setCategory(value);
    onPrepare();
  };

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
    onPrepare();
  };

  const handlePracticeToggle = () => {
    setPractice(!practice);
    onPrepare();
  };

  return (
    <div className="flex flex-col items-center gap-3 mb-6 mt-8">
      <div className="flex items-center justify-center flex-wrap gap-2">
        <Pills
          label="Test mode"
          options={MODE_OPTIONS}
          value={currentModeValue}
          onChange={handleModeChange}
        />

        {/* Category and difficulty pick a database text; in practice mode the text
            is generated from weak keys, so they don't apply and are hidden. */}
        {!practice && (
          <>
            <Separator />

            <Pills
              label="Difficulty"
              options={DIFFICULTY_OPTIONS}
              value={difficulty}
              onChange={setDifficulty}
            />

            {/* ≥sm: category + language inline. */}
            <div className="hidden items-center gap-2 sm:flex">
              <Separator />
              <Pills
                label="Category"
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={handleCategoryChange}
              />
              <Separator />
              <Pills
                label="Language"
                options={LANGUAGE_OPTIONS}
                value={language}
                onChange={handleLanguageChange}
              />
            </div>

            {/* <sm: collapse category + language behind a disclosure that shows
                the current selection so it's not hidden state. */}
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              aria-expanded={showMore}
              aria-controls="settings-more"
              className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs transition-colors sm:hidden ${
                showMore
                  ? 'bg-neutral-800/60 text-neutral-300'
                  : 'text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-300'
              }`}
            >
              <FontAwesomeIcon icon={faSliders} size="sm" />
              {category} · {language}
            </button>
          </>
        )}

        <Separator />

        <button
          type="button"
          onClick={handlePracticeToggle}
          aria-pressed={practice}
          className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-xs transition-colors ${
            practice
              ? 'bg-yellow-500/10 font-semibold text-yellow-500'
              : 'text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-300'
          }`}
        >
          <FontAwesomeIcon icon={faBullseye} size="sm" />
          practice
        </button>
      </div>

      {!practice && showMore && (
        <div
          id="settings-more"
          className="flex flex-col items-center gap-2 sm:hidden"
        >
          <Pills
            label="Category"
            className="flex-wrap justify-center"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={handleCategoryChange}
          />
          <Pills
            label="Language"
            className="flex-wrap justify-center"
            options={LANGUAGE_OPTIONS}
            value={language}
            onChange={handleLanguageChange}
          />
        </div>
      )}
    </div>
  );
};
