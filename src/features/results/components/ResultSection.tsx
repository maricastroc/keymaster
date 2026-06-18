import { ResultChart } from './ResultChart';
import { StatsDisplay } from './StatsDisplay';
import { GeneralStats } from '@/types/generalStats';
import { ChartPoint } from '@/types/chartPoint';
import { ResumeSection } from '@/features/typing/components/ResumeSection';
import { useRoundStats } from '@/features/typing/hooks/useRoundStats';
import { useEffect, useRef } from 'react';
import { Heatmap } from '@/features/results/heatmap/Heatmap';
import { Replay } from '@/features/results/replay/Replay';
import { Keystroke } from '@/types/keyStore';

type ResultSectionProps = {
  generalStats: GeneralStats;
  chartData: ChartPoint[];
  finishedTime: number | null;
  metrics: {
    wpm: number;
    accuracy: number;
  };
  keystrokes: Keystroke[];
  text: string;
};

export const ResultSection = ({
  metrics,
  finishedTime,
  chartData,
  generalStats,
  keystrokes,
  text,
}: ResultSectionProps) => {
  const { saveRound } = useRoundStats();
  const hasSavedRef = useRef(false);

  useEffect(() => {
    if (!finishedTime || metrics.wpm <= 0) return;

    if (hasSavedRef.current) return;

    saveRound({
      wpm: metrics.wpm,
      accuracy: metrics.accuracy,
      time: finishedTime,
    });

    hasSavedRef.current = true;
  }, [finishedTime, metrics.wpm, metrics.accuracy, saveRound]);

  return (
    <div className="mt-8 md:mt-12 flex flex-col items-center justify-center gap-3 w-full">
      <div className="flex flex-col items-center gap-1">
        <h1 className="font-mono text-2xl font-semibold text-yellow-500">done</h1>
        <p className="font-mono text-xs text-neutral-500">keep pushing to beat your best</p>
      </div>
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
