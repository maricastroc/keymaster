import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

interface DataProps {
  id?: string | number;
  name?: string | number;
  isUsed?: boolean;
}

interface SelectInputProps {
  label: string;
  data: DataProps[];
  onSelect: (value: string) => void;
  placeholder: string;
  defaultValue?: string | null;
  compact?: boolean;
}

export const SelectInput = ({
  label,
  data,
  onSelect,
  placeholder,
  defaultValue = null,
  compact,
}: SelectInputProps) => {
  return (
    <Select.Root
      defaultValue={defaultValue || undefined}
      onValueChange={onSelect}
    >
      <label className="sr-only">{label}</label>

      <Select.Trigger
        className={`flex items-center justify-between text-preset-5 text-white bg-neutral-800 border border-neutral-700 shadow-sm rounded-lg ${compact ? 'px-3 py-1 w-28' : 'px-4 py-2 w-36'}`}
        aria-label={label}
      >
        <Select.Value className="text-grey-900" placeholder={placeholder} />
        <Select.Icon className="ml-2 text-grey-900">
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          className="
    z-50
    bg-neutral-900
    border border-neutral-700
    rounded-xl
    shadow-2xl
    max-h-80 overflow-y-auto
  "
          sideOffset={8}
        >
          <Select.ScrollUpButton
            className="flex items-center justify-center text-grey-500 hover:text-grey-900"
            aria-label="Scroll up"
          >
            <ChevronUpIcon />
          </Select.ScrollUpButton>

          <Select.Viewport className="p-1">
            <Select.Group className="divide-y divide-neutral-700">
              {data.map((item, index) => (
                <SelectItem key={index} value={String(item.name).toLowerCase()}>
                  {item.name}
                </SelectItem>
              ))}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton
            className="flex items-center justify-center text-grey-500 hover:text-grey-900"
            aria-label="Scroll down"
          >
            <ChevronDownIcon />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

const SelectItem = React.forwardRef(
  (
    {
      children,
      value,
      disabled,
      ...props
    }: {
      children: React.ReactNode;
      value: string;
      disabled?: boolean;
    },
    ref: React.Ref<HTMLDivElement>
  ) => (
    <Select.Item
      ref={ref}
      value={value}
      disabled={disabled}
      className={`
        relative flex items-center gap-3 px-4 py-3
        text-neutral-200 text-preset-5
        cursor-pointer select-none
        outline-none
        border-b border-neutral-700
        last:border-b-0

        hover:bg-neutral-700/40
        data-highlighted:bg-neutral-700/40
        data-[state=checked]:bg-neutral-800 border border-neutral-700/10
        data-[state=checked]:text-yellow-500
        data-[state=checked]:border-yellow-500/30
        data-[state=checked]:rounded-lg
        data-[state=checked]:border
      `}
      {...props}
    >
      <div
        className={`
          w-4 h-4 rounded-full border-2
          border-neutral-400
          flex items-center justify-center
          transition-all
          data-[state=checked]:border-yellow-500
        `}
      >
        <Select.ItemIndicator>
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
        </Select.ItemIndicator>
      </div>

      <Select.ItemText>{children}</Select.ItemText>
    </Select.Item>
  )
);

SelectItem.displayName = 'SelectItem';
