'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';

const MAX_LENGTH = 5000;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (text: string) => void;
};

export function CustomTextModal({ open, onOpenChange, onSubmit }: Props) {
  const [value, setValue] = useState('');

  // Collapse all whitespace (newlines, tabs, runs of spaces) to single spaces
  // so the space-delimited typing engine treats pasted prose as clean words.
  const normalized = value.replace(/\s+/g, ' ').trim();

  const handleStart = () => {
    if (!normalized) return;
    onSubmit(normalized);
    setValue('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-black/50 animate-overlayShow" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-40 flex w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
        >
          <div>
            <Dialog.Title className="font-display text-base font-semibold uppercase tracking-widest text-neutral-400">
              Custom text
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-xs text-neutral-500">
              Paste any text and practice typing it.
            </Dialog.Description>
          </div>

          <textarea
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
            placeholder="Paste or type your text here…"
            rows={6}
            aria-label="Custom text"
            className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-800 p-3 font-mono text-sm text-neutral-300 outline-none placeholder:text-neutral-600 focus:border-yellow-500"
          />

          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-neutral-600 tabular-nums">
              {normalized.length}/{MAX_LENGTH}
            </span>
            <div className="flex items-center gap-2">
              <Dialog.Close className="cursor-pointer px-3 py-1.5 font-mono text-sm text-neutral-500 transition-colors hover:text-neutral-300">
                Cancel
              </Dialog.Close>
              <button
                onClick={handleStart}
                disabled={!normalized}
                className="cursor-pointer rounded-lg bg-yellow-500 px-4 py-1.5 text-sm font-semibold text-black transition hover:brightness-90 disabled:pointer-events-none disabled:opacity-50"
              >
                Start
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
