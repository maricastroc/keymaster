'use client';

import { useConfig } from '@/features/settings/context/ConfigContext';

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
        className={`cursor-pointer font-mono text-xs px-2.5 py-1 rounded transition-colors ${
          currentValue === opt.value
            ? 'text-yellow-500'
            : 'text-neutral-500 hover:text-neutral-300'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const Separator = () => (
  <span className="text-neutral-700 text-sm select-none">|</span>
);

export const InlineSettings = ({ onPrepare }: InlineSettingsProps) => {
  const { mode, setMode, category, setCategory, difficulty, setDifficulty, initialTime, setInitialTime } =
    useConfig();

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

  return (
    <div className="flex items-center justify-center flex-wrap gap-2 mb-8">
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

    </div>
  );
};
