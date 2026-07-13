'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBullseye } from '@fortawesome/free-solid-svg-icons';

import { useConfig, type Language } from '@/features/settings/context/ConfigContext';

type InlineSettingsProps = {
  onPrepare: () => void;
};

type PillGroupProps = {
  options: { label: string; value: string }[];
  currentValue: string;
  onChange: (value: string) => void;
};

const PillGroup = ({ options, currentValue, onChange }: PillGroupProps) => (
  <div className="flex items-center gap-0.5">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        aria-pressed={currentValue === opt.value}
        className={`cursor-pointer font-mono text-xs px-2.5 py-1 rounded-md transition-colors ${
          currentValue === opt.value
            ? 'text-yellow-500 font-semibold bg-yellow-500/10'
            : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/60'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

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

  const handlePracticeToggle = () => {
    setPractice(!practice);
    onPrepare();
  };

  return (
    <div className="flex items-center justify-center flex-wrap gap-2 mb-6 mt-8">
      <PillGroup
        options={[
          { label: '15s', value: '15' },
          { label: '30s', value: '30' },
          { label: '60s', value: '60' },
          { label: '120s', value: '120' },
          { label: 'passage', value: 'passage' },
        ]}
        currentValue={currentModeValue}
        onChange={handleModeChange}
      />

      <Separator />

      {/* Category and difficulty pick a database text; in practice mode the text
          is generated from weak keys, so they don't apply and are hidden. */}
      {!practice && (
        <>
          <PillGroup
            options={[
              { label: 'easy', value: 'easy' },
              { label: 'medium', value: 'medium' },
              { label: 'hard', value: 'hard' },
            ]}
            currentValue={difficulty}
            onChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard')}
          />

          <Separator />

          <PillGroup
            options={[
              { label: 'general', value: 'general' },
              { label: 'lyrics', value: 'lyrics' },
              { label: 'quotes', value: 'quotes' },
              { label: 'code', value: 'code' },
            ]}
            currentValue={category}
            onChange={(v) => { setCategory(v as 'general' | 'lyrics' | 'quotes' | 'code'); onPrepare(); }}
          />

          <Separator />

          <PillGroup
            options={[
              { label: 'en', value: 'en' },
              { label: 'pt', value: 'pt' },
              { label: 'es', value: 'es' },
              { label: 'fr', value: 'fr' },
              { label: 'de', value: 'de' },
            ]}
            currentValue={language}
            onChange={(v) => { setLanguage(v as Language); onPrepare(); }}
          />

          <Separator />
        </>
      )}

      <button
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
  );
};
