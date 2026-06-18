/* eslint-disable @typescript-eslint/no-explicit-any */
import { SelectInput } from './SelectInput';

type Option = {
  label: string;
  value: string;
};

type SettingsRowProps = {
  label: string;
  type: 'radio' | 'dropdown';
  options: Option[];
  currentValue: string;
  onChange: (value: any) => void;
  compact?: boolean;
};

export const SettingsRow = ({
  label,
  type,
  options,
  currentValue,
  onChange,
  compact,
}: SettingsRowProps) => {
  if (type === 'dropdown') {
    return (
      <div className="flex gap-2 items-center justify-start">
        <span className="text-neutral-500 text-preset-5 w-20">{label}</span>
        <SelectInput
          label={label}
          placeholder={`Select ${label.toLowerCase()}`}
          defaultValue={currentValue}
          data={options.map((opt) => ({
            id: opt.value,
            name: opt.label,
          }))}
          onSelect={(item) => onChange(item)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-start gap-2">
      <label className="text-neutral-500 text-preset-5 w-20">{label}</label>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              cursor-pointer rounded-md text-preset-5 transition
              ${compact ? 'px-3 py-1' : 'px-4 py-2 rounded-lg'}
              ${
                currentValue === option.value
                  ? 'text-yellow-500 bg-neutral-800'
                  : 'text-neutral-500 hover:text-neutral-300'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
