/**
 * Coefficient of variation (population standard deviation ÷ mean) of a series.
 * A unitless measure of spread: 0 means every value is identical, higher means
 * more scattered. Returns 0 when there are fewer than two values or the mean is
 * not positive — nothing meaningful to compare.
 */
export function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean <= 0) return 0;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

/**
 * Turns a series of per-second WPM samples into a 0–100 consistency score: how
 * steady the pace was, independent of raw speed. Uses MonkeyType's "kogasa"
 * mapping of the coefficient of variation so scores line up with what typists
 * expect elsewhere — cv 0 → 100, and the score falls off smoothly as the pace
 * gets more erratic. Returns 0 for runs too short to judge (< 2 samples).
 *
 * Feed it the *instantaneous* per-second WPM (each second in isolation), not a
 * running average — a cumulative series converges over time and would report
 * near-perfect consistency for everyone.
 */
export function consistencyScore(perSecondWpm: number[]): number {
  if (perSecondWpm.length < 2) return 0;
  const cv = coefficientOfVariation(perSecondWpm);
  const score = 100 * (1 - Math.tanh(cv + cv ** 3 / 3 + cv ** 5 / 5));
  return Math.max(0, Math.min(100, Math.round(score)));
}
