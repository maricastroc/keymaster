export type ChartPoint = {
  second: number;
  wpm: number;
  accuracy: number;
  raw: number;
  burst: number;
  errors: number | null;
  errorCount: number;
};
