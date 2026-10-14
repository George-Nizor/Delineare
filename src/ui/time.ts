import { DAY, type LogEntry } from '../engine/review';

// "today", "yesterday", "3 days ago": how long since something was last done.
export function ago(time: number, now = Date.now()): string {
  const days = Math.floor((startOfDay(now) - startOfDay(time)) / DAY);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 60) return `${days} days ago`;
  return `on ${new Date(time).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

const startOfDay = (time: number) => {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

// When each practice item was last done, from the practice log.
export function lastDone(log: readonly LogEntry[]): Map<string, number> {
  const last = new Map<string, number>();
  for (const entry of log) if ((last.get(entry.practiceId) ?? 0) < entry.at) last.set(entry.practiceId, entry.at);
  return last;
}
