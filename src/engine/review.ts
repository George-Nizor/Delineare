// What to suggest next, as pure functions so the rules can be tested without a browser.
//
// A lesson is finished when its checks held (done) or the learner said they know it. A finished
// lesson comes back for review at growing gaps after its last practice: about 2 days, 1 week,
// 3 weeks, then every 2 months. Nothing is ever shown as overdue or missed; a review that is due
// is simply what gets suggested first.

export const DAY = 86_400_000;
export const REVIEW_DAYS = [2, 7, 21, 60] as const;

export interface LessonRecord {
  slug: string;
  state: 'tried' | 'done';
  known: boolean;
  triedAt: number;
  doneAt?: number;
  knownAt?: number;
}

export interface LogEntry {
  id?: number;
  practiceId: string;
  lesson: string;
  at: number;
  pageId?: number;
}

export function isFinished(record: LessonRecord | undefined): boolean {
  return Boolean(record && (record.state === 'done' || record.known));
}

// The lesson to continue: the first written lesson, in course order, that is not finished.
export function currentLesson(order: readonly string[], records: ReadonlyMap<string, LessonRecord>): string | null {
  return order.find((slug) => !isFinished(records.get(slug))) ?? null;
}

// When a finished lesson next comes up for review, or null while it is not finished.
export function nextReview(record: LessonRecord | undefined, entries: readonly LogEntry[]): number | null {
  if (!record || !isFinished(record)) return null;
  const start = record.doneAt ?? record.knownAt ?? record.triedAt;
  const after = entries.filter((entry) => entry.at > start).map((entry) => entry.at).sort((a, b) => a - b);
  const last = after.at(-1) ?? start;
  const gap = REVIEW_DAYS[Math.min(after.length, REVIEW_DAYS.length - 1)]!;
  return last + gap * DAY;
}

export interface Suggestion {
  role: 'continue' | 'review' | 'warm-up' | 'free';
  practiceId?: string;
  prompt?: string;
}

export interface SuggestInput {
  order: readonly string[];
  records: ReadonlyMap<string, LessonRecord>;
  // Practice ids for each written lesson, the lesson's main exercise first.
  practice: ReadonlyMap<string, readonly string[]>;
  log: readonly LogEntry[];
  now: number;
  prompt: string;
}

function lastPractised(id: string, log: readonly LogEntry[]): number {
  let latest = -Infinity;
  for (const entry of log) if (entry.practiceId === id && entry.at > latest) latest = entry.at;
  return latest;
}

// The item from a lesson that was practised longest ago, skipping the main exercise when there is
// anything else, since the lesson page already offers that.
function stalest(ids: readonly string[], log: readonly LogEntry[]): string | undefined {
  const pool = ids.length > 1 ? ids.slice(1) : ids;
  return [...pool].sort((a, b) => lastPractised(a, log) - lastPractised(b, log))[0];
}

// Up to three suggestions: one from the lesson in progress, one review or warm-up from a finished
// lesson, and one prompt to draw something for its own sake (Drawabox's 50% rule).
export function suggest(input: SuggestInput): Suggestion[] {
  const { order, records, practice, log, now, prompt } = input;
  const out: Suggestion[] = [];
  const current = currentLesson(order, records);

  if (current && records.get(current)) {
    const ids = practice.get(current) ?? [];
    const untried = ids.slice(1).find((id) => lastPractised(id, log) === -Infinity);
    const pick = untried ?? stalest(ids, log);
    if (pick) out.push({ role: 'continue', practiceId: pick });
  }

  const finished = order.filter((slug) => slug !== current && isFinished(records.get(slug)));
  const due = finished
    .map((slug) => ({ slug, at: nextReview(records.get(slug), log.filter((entry) => entry.lesson === slug)) ?? Infinity }))
    .filter(({ at }) => at <= now)
    .sort((a, b) => a.at - b.at)[0];
  if (due) {
    const pick = stalest(practice.get(due.slug) ?? [], log);
    if (pick) out.push({ role: 'review', practiceId: pick });
  } else if (finished.length) {
    const quietest = [...finished].sort((a, b) => {
      const latest = (slug: string) => Math.max(...(practice.get(slug) ?? []).map((id) => lastPractised(id, log)));
      return latest(a) - latest(b);
    })[0]!;
    const pick = stalest(practice.get(quietest) ?? [], log);
    if (pick) out.push({ role: 'warm-up', practiceId: pick });
  }

  out.push({ role: 'free', prompt });
  return out;
}
