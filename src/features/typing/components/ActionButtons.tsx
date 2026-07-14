'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleRight,
  faArrowRotateRight,
  faShuffle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { AppTooltip } from '@/components/ui/tooltip';

interface ActionButtonsProps {
  onRandomize: () => void;
  onRestart: () => void;
  onNext: () => void;
  isLoading?: boolean;
  loadingButton?: 'randomize' | 'next' | null;
}

export const ActionButtons = ({
  onRandomize,
  onRestart,
  onNext,
  isLoading = false,
  loadingButton = null,
}: ActionButtonsProps) => {
  const buttons = [
    {
      id: 'randomize',
      icon: faShuffle,
      tooltip: 'Randomize',
      onClick: onRandomize,
      isLoading: isLoading && loadingButton === 'randomize',
    },
    {
      id: 'restart',
      icon: faArrowRotateRight,
      tooltip: 'Restart',
      onClick: onRestart,
      isLoading: false,
    },
    {
      id: 'next',
      icon: faAngleRight,
      tooltip: 'Next Text',
      onClick: onNext,
      isLoading: isLoading && loadingButton === 'next',
    },
  ];

  return (
    <>
      <div className="flex items-center justify-center gap-6 mt-14">
        {buttons.map((button) => (
          <button
            key={button.id}
            onClick={button.onClick}
            disabled={button.isLoading}
            aria-label={button.tooltip}
            aria-busy={button.isLoading}
            data-tooltip-id={`${button.id}-tooltip`}
            data-tooltip-content={button.tooltip}
            data-tooltip-place="top"
            className={`cursor-pointer inline-flex items-center justify-center min-h-11 min-w-11 text-neutral-500 hover:text-neutral-300 transition-colors ${button.isLoading ? 'animate-pulse' : ''}`}
          >
            <FontAwesomeIcon icon={button.isLoading ? faSpinner : button.icon} spin={button.isLoading} size="sm" />
          </button>
        ))}
      </div>

      {buttons.map((button) => (
        <AppTooltip key={button.id} id={`${button.id}-tooltip`} />
      ))}
    </>
  );
};
