import { formatDistanceToNow } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { RoundStats } from '@/types/roundStats';

type HistoryRowProps = {
  round: RoundStats;
  isBest: boolean;
  isConfirming: boolean;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
};

/**
 * A single saved round: personal-best crown, WPM/accuracy/time/mode, relative
 * timestamp, and an inline delete-with-confirm control. Presentational — all
 * state lives in the parent drawer.
 */
export function HistoryRow({
  round,
  isBest,
  isConfirming,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: HistoryRowProps) {
  return (
    <div className="group flex items-center justify-between py-4 transition-colors duration-200 hover:bg-neutral-800/20">
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
        <p className="text-xs text-neutral-500">
          {formatDistanceToNow(round.timestamp, { addSuffix: true })}
        </p>
        {isConfirming ? (
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={onConfirmDelete}
              className="cursor-pointer text-red-400 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={onCancelDelete}
              className="cursor-pointer text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={onRequestDelete}
            aria-label={`Delete round: ${round.wpm} wpm, ${round.mode}`}
            data-tooltip-id="history-tip"
            data-tooltip-content="Delete"
            className="cursor-pointer p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity text-neutral-500 hover:text-red-400"
          >
            <FontAwesomeIcon icon={faTrash} size="sm" />
          </button>
        )}
      </div>
    </div>
  );
}
