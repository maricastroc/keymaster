import { ResultChart } from './ResultChart';
import { StatsDisplay } from './StatsDisplay';
import { GeneralStats } from '@/types/generalStats';
import { ChartPoint } from '@/types/chartPoint';
import { ResumeSection } from '@/features/typing/components/ResumeSection';
import { Heatmap } from '@/features/results/heatmap/Heatmap';
import { Replay } from '@/features/results/replay/Replay';
import { ShareResult } from './ShareResult';
import { useConfig } from '@/features/settings/context/ConfigContext';
import { Keystroke } from '@/types/keyStore';

// Presentational only. Persistence is owned by the typing engine's `onFinished`
// callback (see home/index.tsx) so a round is saved exactly once. Saving here as
// well produced duplicate rows for authenticated users (no cross-instance dedupe).
type ResultSectionProps = {
  generalStats: GeneralStats;
  chartData: ChartPoint[];
  finishedTime: number | null;
  keystrokes: Keystroke[];
  text: string;
  isNewBest?: boolean;
};

export const ResultSection = ({
  finishedTime,
  chartData,
  generalStats,
  keystrokes,
  text,
  isNewBest = false,
}: ResultSectionProps) => {
  const { mode, difficulty } = useConfig();

  return (
    <div className="mt-8 md:mt-12 flex flex-col items-center justify-center gap-3 w-full">
      <div className="flex flex-col items-center gap-1">
        <h1
          className={`font-mono text-2xl font-semibold text-yellow-500 ${
            isNewBest ? 'animate-countdownPop' : ''
          }`}
        >
          {isNewBest ? 'new best!' : 'done'}
        </h1>
        <p className="font-mono text-xs text-neutral-500">
          {isNewBest ? 'you beat your personal best 🎉' : 'keep pushing to beat your best'}
        </p>
      </div>

      <ShareResult
        wpm={generalStats.wpm}
        accuracy={generalStats.accuracy}
        consistency={generalStats.consistency}
        mode={mode}
        difficulty={difficulty}
      />
      <div className="w-full max-w-5xl flex flex-col gap-4 items-center justify-center">
        <StatsDisplay stats={generalStats} />
        <ResultChart data={chartData} />
        <Heatmap keystrokes={keystrokes} text={text} />
        <Replay keystrokes={keystrokes} text={text} />
      </div>

      <ResumeSection generalStats={generalStats} finishedTime={finishedTime} />
    </div>
  );
};
