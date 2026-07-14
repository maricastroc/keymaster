/** Human-readable duration from seconds: `45s`, `2m 5s`. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m === 0 ? `${rem}s` : `${m}m ${rem}s`;
}
