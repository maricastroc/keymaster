'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleRight,
  faArrowRotateRight,
  faArrowsRotate,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'react-tooltip';

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
      icon: faArrowsRotate,
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
            data-tooltip-id={`${button.id}-tooltip`}
            data-tooltip-content={button.tooltip}
            data-tooltip-place="top"
            className={`cursor-pointer text-neutral-500 hover:text-neutral-300 transition-colors p-1 ${button.isLoading ? 'animate-pulse' : ''}`}
          >
            <FontAwesomeIcon icon={button.isLoading ? faSpinner : button.icon} spin={button.isLoading} size="sm" />
          </button>
        ))}
      </div>

      {buttons.map((button) => (
        <Tooltip
          key={button.id}
          className="!bg-[#262626] !text-white !text-xs !px-3 !py-1 !rounded-md"
          id={`${button.id}-tooltip`}
        />
      ))}
    </>
  );
};
