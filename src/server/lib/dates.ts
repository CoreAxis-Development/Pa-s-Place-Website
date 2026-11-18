// Calendar-date helpers. Booking dates are plain YYYY-MM-DD strings with no
// time zone: a night in Pennington is the same night wherever the server runs.

const DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');

export const fromIso = (s: string) => new Date(`${s}T00:00:00Z`);
export const toIso = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;

/** True for a real calendar date written as YYYY-MM-DD (rejects 2026-02-31). */
export const isIsoDate = (s: unknown): s is string =>
  typeof s === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(fromIso(s).getTime()) &&
  toIso(fromIso(s)) === s;

export const addDays = (s: string, n: number) => toIso(new Date(fromIso(s).getTime() + n * DAY));
export const daysBetween = (a: string, b: string) => Math.round((fromIso(b).getTime() - fromIso(a).getTime()) / DAY);

/** Today's date in South Africa (UTC+2, no daylight saving). */
export const todaySast = (now = new Date()) => toIso(new Date(now.getTime() + 2 * 3_600_000));

/** Every date from `start` up to but not including `end`. */
export function eachDate(start: string, end: string): string[] {
  const out: string[] = [];
  for (let d = start; d < end; d = addDays(d, 1)) out.push(d);
  return out;
}

export const formatDate = (
  s: string,
  opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
) => fromIso(s).toLocaleDateString('en-ZA', { ...opts, timeZone: 'UTC' });

export const formatDateTime = (d: Date) =>
  d.toLocaleString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Johannesburg',
  });

/** "3 hours ago" style label for activity feeds. */
export function timeAgo(d: Date, now = new Date()): string {
  const s = Math.max(0, Math.round((now.getTime() - d.getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDateTime(d);
}
