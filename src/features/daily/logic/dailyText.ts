/** UTC calendar day as `YYYY-MM-DD` — the shared boundary for the daily
 * challenge, so everyone in the world rolls over at the same instant. */
export function utcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Deterministic index into a list of `count` items for a given day. Lets every
 * client pick the same daily text with no stored state and no scheduler: the
 * date string is hashed and folded into the range. Stable for a date, and
 * spread across the pool as the date changes.
 */
export function dailyIndex(dateStr: string, count: number): number {
  if (count <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % count;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Formats a `YYYY-MM-DD` string as `July 14, 2026` without touching `Date` or
 * locale APIs, so it renders identically on the server and client (no
 * hydration mismatch, no timezone drift).
 */
export function formatDailyDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const month = MONTHS[m - 1];
  if (!month || !y || !d) return dateStr;
  return `${month} ${d}, ${y}`;
}
