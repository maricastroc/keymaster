import { cn } from '@/lib/utils';

export type PillOption<T extends string> = {
  label: string;
  value: T;
};

type PillsProps<T extends string> = {
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the group (announced by screen readers). */
  label?: string;
  /** Extra classes for the container (e.g. wrap/justify overrides). */
  className?: string;
};

/**
 * The app's single segmented-control primitive. One visual language for every
 * "pick one of a few" control — settings, leaderboard periods, history filters —
 * so the same gesture always looks and behaves the same.
 */
export function Pills<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: PillsProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('flex items-center gap-0.5', className)}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            'cursor-pointer rounded-md px-2.5 py-1 font-mono text-xs transition-colors',
            value === opt.value
              ? 'bg-yellow-500/10 font-semibold text-yellow-500'
              : 'text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-300'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
