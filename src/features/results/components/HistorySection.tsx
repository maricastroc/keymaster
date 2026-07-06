'use client';

import { useRoundStats } from '@/features/typing/hooks/useRoundStats';
import * as Dialog from '@radix-ui/react-dialog';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faTrash } from '@fortawesome/free-solid-svg-icons';
import { roundsApi } from '@/services/roundsApi';
import useSWR from 'swr';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ModeFilter = 'all' | 'timed' | 'passage';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

function FilterPills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-center">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`cursor-pointer font-mono text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
            value === opt.value
              ? 'bg-yellow-500 border-yellow-500 text-black'
              : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-300 hover:border-neutral-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function HistorySection({ open, onOpenChange }: Props) {
  const { getHistory, deleteRound, isLoggedIn } = useRoundStats();

  const [isOpen, setIsOpen] = useState(open);
  const [shouldRender, setShouldRender] = useState(open);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<ModeFilter>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<DifficultyFilter>('all');

  const { data: apiRounds, mutate } = useSWR(
    isLoggedIn ? '/api/rounds' : null,
    () => roundsApi.fetchRounds()
  );

  const allRounds = isLoggedIn ? (apiRounds ?? []) : getHistory();
  const rounds = allRounds.filter(
    (r) =>
      (filterMode === 'all' || r.mode === filterMode) &&
      (filterDifficulty === 'all' || r.difficulty === filterDifficulty)
  );
  // Best within the current filter, so the crown reflects what's on screen.
  const personalBest = rounds.length > 0 ? Math.max(...rounds.map((r) => r.wpm)) : 0;

  const isLoadingHistory = isLoggedIn && apiRounds === undefined;

  const handleDelete = async (id: string) => {
    if (isLoggedIn) {
      await roundsApi.deleteRound(id);
      mutate(apiRounds?.filter((r) => r.id !== id), { revalidate: true });
    } else {
      deleteRound(id);
    }
  };

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
            fixed top-0 right-0 h-full w-full max-w-[420px]
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
            <p className="text-xs font-display text-neutral-600 mt-1 text-center">
              {rounds.length > 0
                ? `${rounds.length} ${rounds.length === 1 ? 'round' : 'rounds'}`
                : isLoggedIn
                  ? 'Your saved rounds'
                  : 'Review your type history'}
            </p>
          </Dialog.Description>

          {allRounds.length > 0 && (
            <div className="mt-6 flex flex-col gap-1.5 items-center">
              <FilterPills
                value={filterMode}
                onChange={setFilterMode}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'timed', label: 'Timed' },
                  { value: 'passage', label: 'Passage' },
                ]}
              />
              <FilterPills
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
              {rounds.map((round) => {
                const isBest = round.wpm === personalBest;
                const isConfirming = confirmDeleteId === round.id;

                return (
                  <div
                    key={round.id}
                    className="group flex items-center justify-between py-4 transition-colors duration-200 hover:bg-neutral-800/20"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 flex-shrink-0 text-center">
                        {isBest && (
                          <FontAwesomeIcon
                            icon={faCrown}
                            size="xs"
                            className="text-yellow-500 opacity-70"
                            title="Personal best"
                          />
                        )}
                      </span>
                      <div>
                        <p className="text-preset-3-semibold text-yellow-500">
                          {round.wpm}{' '}
                          <span className="text-preset-7 text-neutral-500 font-mono">wpm</span>
                        </p>
                        <p className="text-preset-7 text-neutral-400 font-mono">
                          {round.accuracy}% acc
                          <span className="mx-1 text-neutral-600">•</span>
                          {round.time}s
                          <span className="mx-1 text-neutral-600">•</span>
                          {round.mode}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xs text-neutral-600">
                        {formatDistanceToNow(round.timestamp, { addSuffix: true })}
                      </p>
                      {isConfirming ? (
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <button
                            onClick={() => { handleDelete(round.id); setConfirmDeleteId(null); }}
                            className="cursor-pointer text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="cursor-pointer text-neutral-500 hover:text-neutral-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(round.id)}
                          aria-label={`Delete round: ${round.wpm} wpm, ${round.mode}`}
                          title="Delete"
                          className="cursor-pointer p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-neutral-500 hover:text-red-400"
                        >
                          <FontAwesomeIcon icon={faTrash} size="sm" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Dialog.Close className="cursor-pointer mt-6 text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-200 text-center py-2 flex-shrink-0">
              close
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
