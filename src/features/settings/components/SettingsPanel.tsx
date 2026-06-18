import { SettingsRow } from './SettingsRow';
import { SelectInput } from './SelectInput';
import { Button } from '@/components/ui/button';
import { useSound } from '@/features/sound/context/SoundContext';
import { useConfig } from '@/features/settings/context/ConfigContext';

type SettingsPanelProps = {
  setIsOpen: (value: boolean) => void;
  onPrepare: () => void;
};

export const SettingsPanel = ({ setIsOpen, onPrepare }: SettingsPanelProps) => {
  const { mode, setMode, category, setCategory, difficulty, setDifficulty, initialTime, setInitialTime, theme, setTheme } =
    useConfig();

  const currentModeValue = mode === 'passage' ? 'passage' : String(initialTime);

  const handleModeChange = (value: string) => {
    if (value === 'passage') {
      setMode('passage');
    } else {
      setMode('timed');
      setInitialTime(Number(value));
    }
  };

  const { soundName, setSoundName, volume, setVolume, playPreview } = useSound();

  return (
    <div
      className="w-full shadow-2xl xl:px-28 animate-slideUp bg-neutral-900 border-t border-neutral-700"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="w-full h-[0.05rem] bg-neutral-800 block" />

      <div className="py-5 px-2">
        <div className="flex items-start justify-between gap-8 flex-wrap">

          <div className="flex flex-col gap-4">
            <SettingsRow
              label="Mode"
              type="radio"
              compact
              currentValue={currentModeValue}
              onChange={handleModeChange}
              options={[
                { label: '15s', value: '15' },
                { label: '30s', value: '30' },
                { label: '60s', value: '60' },
                { label: '120s', value: '120' },
                { label: 'Passage', value: 'passage' },
              ]}
            />
            <SettingsRow
              label="Difficulty"
              type="radio"
              compact
              currentValue={difficulty}
              onChange={setDifficulty}
              options={[
                { label: 'Easy', value: 'easy' },
                { label: 'Medium', value: 'medium' },
                { label: 'Hard', value: 'hard' },
              ]}
            />
            <SettingsRow
              label="Category"
              type="radio"
              compact
              currentValue={category}
              onChange={(value) => {
                setCategory(value);
                onPrepare();
              }}
              options={[
                { label: 'General', value: 'general' },
                { label: 'Lyrics', value: 'lyrics' },
                { label: 'Quotes', value: 'quotes' },
                { label: 'Code', value: 'code' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-preset-5 w-20">Sound</span>
                <SelectInput
                  label="Sound"
                  placeholder="Select sound"
                  defaultValue={soundName}
                  compact
                  data={[
                    { id: 'creamy', name: 'Creamy' },
                    { id: 'beep', name: 'Beep' },
                    { id: 'osu', name: 'Osu' },
                    { id: 'pop', name: 'Pop' },
                    { id: 'punch', name: 'Punch' },
                    { id: 'typewriter', name: 'Typewriter' },
                    { id: 'click', name: 'Click' },
                    { id: 'hitmarker', name: 'Hitmarker' },
                  ]}
                  onSelect={(item) => setSoundName(item as import('@/features/sound/context/SoundContext').SoundOption)}
                />
                <Button variant="ghost" size="icon" onClick={playPreview} title="Preview sound">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                  </svg>
                </Button>
              </div>
              <div className="flex items-center gap-2 pl-20">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-28 h-1 rounded-full accent-blue-500 cursor-pointer"
                />
                <span className="text-neutral-600 text-preset-5 w-7 text-right tabular-nums">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>

            <SettingsRow
              label="Caret"
              type="radio"
              compact
              currentValue="pip"
              onChange={() => {}}
              options={[
                { label: 'Pip', value: 'pip' },
                { label: 'Box', value: 'box' },
                { label: 'Underline', value: 'underline' },
              ]}
            />
            <SettingsRow
              label="Theme"
              type="radio"
              compact
              currentValue={theme}
              onChange={(value) => setTheme(value as 'dark' | 'light')}
              options={[
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' },
              ]}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="ml-auto self-start text-neutral-500 hover:text-neutral-200"
            title="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};
