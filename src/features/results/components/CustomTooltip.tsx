/* eslint-disable @typescript-eslint/no-explicit-any */
export const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  const safeWPM =
    typeof point.wpm === 'number' && !isNaN(point.wpm) ? point.wpm : 0;
  const safeAccuracy =
    typeof point.accuracy === 'number' && !isNaN(point.accuracy)
      ? point.accuracy
      : 0;
  const safeErrorCount =
    typeof point.errorCount === 'number' && !isNaN(point.errorCount)
      ? point.errorCount
      : 0;

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 shadow-xl space-y-1.5 min-w-36">
      <p className="font-mono text-xs text-neutral-400">second {point.second}</p>

      <div className="flex justify-between text-xs gap-4 font-mono">
        <span className="text-neutral-500">WPM</span>
        <span className="text-neutral-400 font-semibold">{safeWPM}</span>
      </div>

      <div className="flex justify-between text-xs gap-4 font-mono">
        <span className="text-neutral-500">Accuracy</span>
        <span className="text-neutral-400 font-semibold">{safeAccuracy}%</span>
      </div>

      <div className="flex justify-between text-xs gap-4 font-mono">
        <span className="text-neutral-500">Errors</span>
        <span className={`font-semibold ${safeErrorCount > 0 ? 'text-red-500' : 'text-neutral-400'}`}>{safeErrorCount}</span>
      </div>
    </div>
  );
};
