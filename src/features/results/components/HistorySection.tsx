'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { AppTooltip } from '@/components/ui/tooltip';
import { Pills } from '@/components/ui/pills';
import { HistoryRow } from './HistoryRow';
import {
  useHistoryRounds,
  type ModeFilter,
  type DifficultyFilter,
} from './useHistoryRounds';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function HistorySection({ open, onOpenChange }: Props) {
  const [isOpen, setIsOpen] = useState(open);
  const [shouldRender, setShouldRender] = useState(open);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<ModeFilter>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyFilter>('all');

  const { allRounds, rounds, personalBest, isLoadingHistory, isLoggedIn, deleteRound } =
    useHistoryRounds(filterMode, filterDifficulty);

  useEffect(() => {
    if (open) {
      setIsOpen(true);
      setShouldRender(true);
    } else {
      setIsOpen(false);
      setConfirmDeleteId(null);
      setFilterMode('all');
      setFilterDifficulty('all');
      const timer = setTimeout(() => setShouldRender(false), 250);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!shouldRender) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`
            fixed inset-0 bg-black/50
            transition-opacity duration-200
            ${isOpen ? 'opacity-100' : 'opacity-0'}
          `}
        />

        <Dialog.Content
          className={`
            fixed top-0 right-0 h-full w-full max-w-105
            bg-neutral-900 border-l border-neutral-700
            p-8 shadow-2xl
            transition-transform duration-250 ease-out
            flex flex-col
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          onEscapeKeyDown={() => onOpenChange(false)}
        >
          <Dialog.Title asChild>
            <h1 className="text-base font-semibold font-display text-neutral-400 text-center tracking-widest uppercase">History</h1>
          </Dialog.Title>
          <Dialog.Description asChild>
            <p className="text-xs font-display text-neutral-500 mt-1 text-center">
              {rounds.length > 0
                ? `${rounds.length} ${rounds.length === 1 ? 'round' : 'rounds'}`
                : isLoggedIn
                  ? 'Your saved rounds'
                  : 'Review your type history'}
            </p>
          </Dialog.Description>

          {allRounds.length > 0 && (
            <div className="mt-6 flex flex-col gap-1.5 items-center">
              <Pills
                label="Filter by mode"
                className="flex-wrap justify-center gap-1.5"
                value={filterMode}
                onChange={setFilterMode}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'timed', label: 'Timed' },
                  { value: 'passage', label: 'Passage' },
                ]}
              />
              <Pills
                label="Filter by difficulty"
                className="flex-wrap justify-center gap-1.5"
                value={filterDifficulty}
                onChange={setFilterDifficulty}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'easy', label: 'Easy' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' },
                ]}
              />
            </div>
          )}

          <div className="mt-4 flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden divide-y divide-neutral-800">
              {isLoadingHistory && (
                <div className="flex flex-col gap-3 pt-4" aria-hidden>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-11 rounded-lg bg-neutral-800 animate-pulse" />
                  ))}
                </div>
              )}
              {!isLoadingHistory && rounds.length === 0 && (
                <p className="text-neutral-500 text-center text-sm mt-8">
                  {allRounds.length === 0 ? 'No rounds yet.' : 'No rounds match these filters.'}
                </p>
              )}
              {rounds.map((round) => (
                <HistoryRow
                  key={round.id}
                  round={round}
                  isBest={round.wpm === personalBest}
                  isConfirming={confirmDeleteId === round.id}
                  onRequestDelete={() => setConfirmDeleteId(round.id)}
                  onConfirmDelete={() => { deleteRound(round.id); setConfirmDeleteId(null); }}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                />
              ))}
            </div>

            <Dialog.Close className="cursor-pointer mt-6 text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-200 text-center py-2 shrink-0">
              close
            </Dialog.Close>

            <AppTooltip id="history-tip" place="left" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
