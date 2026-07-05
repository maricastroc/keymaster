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

export function HistorySection({ open, onOpenChange }: Props) {
  const { getHistory, deleteRound, isLoggedIn } = useRoundStats();

  const [isOpen, setIsOpen] = useState(open);
  const [shouldRender, setShouldRender] = useState(open);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: apiRounds, mutate } = useSWR(
    isLoggedIn ? '/api/rounds' : null,
    () => roundsApi.fetchRounds()
  );

  const rounds = isLoggedIn ? (apiRounds ?? []) : getHistory();
  const personalBest = rounds.length > 0 ? Math.max(...rounds.map((r) => r.wpm)) : 0;

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
          <h1 className="text-base font-semibold font-display text-neutral-400 text-center tracking-widest uppercase">History</h1>
          <p className="text-xs font-display text-neutral-600 mt-1 text-center">
            {rounds.length > 0
              ? `${rounds.length} ${rounds.length === 1 ? 'round' : 'rounds'}`
              : isLoggedIn
                ? 'Your saved rounds'
                : 'Review your type history'}
          </p>

          <div className="mt-8 flex flex-col flex-1 min-h-0">
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-neutral-800">
              {rounds.length === 0 && (
                <p className="text-neutral-500 text-center text-sm mt-8">No rounds yet.</p>
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
                          className="cursor-pointer p-1.5 -m-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-neutral-600 hover:text-red-400"
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
