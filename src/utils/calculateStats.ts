import { ChartPoint } from '@/types/chartPoint';
import { GeneralStats } from '@/types/generalStats';
import { Keystroke } from '@/types/keyStore';

export const calculateGeneralStats = (
  keystrokes: Keystroke[],
  chartData: ChartPoint[],
  totalTimeSeconds: number
): GeneralStats => {
  if (!keystrokes.length || !chartData.length) {
    return {
      wpm: 0,
      raw: 0,
      accuracy: 100,
      characters: { correct: 0, total: 0 },
      consistency: 0,
      time: 0,
      peakWPM: 0,
      peakRaw: 0,
    };
  }

  const totalCorrect = keystrokes.filter(
    (k) => k.isCorrect && k.typedChar !== 'Backspace'
  ).length;

  const totalTyped = keystrokes.filter(
    (k) => k.typedChar !== 'Backspace'
  ).length;

  const accuracy =
    totalTyped > 0 ? Math.round((totalCorrect / totalTyped) * 100) : 100;

  const minutes = Math.max(0.01, totalTimeSeconds / 60);
  const wpm = Math.round(totalCorrect / 5 / minutes);
  const raw = Math.round(totalTyped / 5 / minutes);

  const peakWPM = Math.max(
    ...chartData.map((d) => d.wpm).filter((v) => !isNaN(v))
  );
  const peakRaw = Math.max(
    ...chartData.map((d) => d.raw).filter((v) => !isNaN(v))
  );

  const wpmValues = chartData
    .map((d) => d.wpm)
    .filter((v) => !isNaN(v) && v > 0);

  let consistency = 0;
  if (wpmValues.length > 1) {
    const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
    const variance =
      wpmValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      wpmValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100;

    consistency = Math.max(0, Math.min(100, Math.round(100 - cv)));
  }

  return {
    wpm,
    raw,
    accuracy,
    characters: {
      correct: totalCorrect,
      total: totalTyped,
    },
    consistency,
    time: totalTimeSeconds,
    peakWPM,
    peakRaw,
  };
};
