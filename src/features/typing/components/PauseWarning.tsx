import { faArrowPointer } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type PauseWarningProps = {
  onResume: () => void;
};

export const PauseWarning = ({ onResume }: PauseWarningProps) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg">
      <h2 className="text-preset-4-semibold text-neutral-0">Paused — you switched away</h2>
      <button
        onClick={onResume}
        className="cursor-pointer text-preset-5-semibold mt-3 text-neutral-0 hover:text-blue-400 transition-all duration-200"
      >
        <FontAwesomeIcon className="text-preset-5 mr-1" icon={faArrowPointer} />
        Press any key or click to resume
      </button>
    </div>
  );
};
