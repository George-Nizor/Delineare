import type { Course } from '../data/load';
import type { Module, Practice, TemplateSession, Timer, PracticeReference } from '../data/types';
import type { CheckAnswer, Progress } from '../store/db';

// Pure scheduling rules. Nothing here touches storage, so every rule can be tested on its own.
//
// The rules come from the round 1 research (docs/CURRICULUM.md and Instrumenta's
// docs/suite/delineare): a module counts as done only when its checks hold again on a later day,
// revisits are short cold redraws at growing intervals, a session has one clear main task, and
// nothing ever piles up into a backlog.

export type Status = 'locked' | 'available' | 'active' | 'first-pass' | 'passed';

export const REVISIT_DAYS = [2, 7, 21, 60, 120];
const MAX_REVISITS_PER_SESSION = 2;

export function today(now = new Date()): string {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export type ProgressMap = Map<string, Progress>;

// A prerequisite is met once its checks have all held at least once; the second day is for
// the module's own "done", not for unlocking what comes next.
export function prerequisitesMet(module: Module, progress: ProgressMap): boolean {
  return module.prerequisites.every((id) => Boolean(progress.get(id)?.firstPass));
}

export function statusOf(module: Module, progress: ProgressMap): Status {
  const row = progress.get(module.id);
  if (row?.passed) return 'passed';
  if (row?.firstPass) return 'first-pass';
  if (row) return 'active';
  return prerequisitesMet(module, progress) ? 'available' : 'locked';
}

// The module today's main exercise comes from: the one chosen by hand if it can be studied,
// otherwise the spine module most recently practised and not yet through its checks, otherwise
// the first spine module that is open, taking the strand that has waited longest.
export function currentModule(course: Course, progress: ProgressMap, chosen: string | null = null): Module | null {
  const open = (module: Module) => ['available', 'active'].includes(statusOf(module, progress));
  if (chosen) {
    const module = course.module.get(chosen);
    if (module && statusOf(module, progress) !== 'locked' && statusOf(module, progress) !== 'passed') return module;
  }
  const spine = course.order.filter((module) => module.spine && !module.ongoing);
  const active = spine
    .filter((module) => statusOf(module, progress) === 'active')
    .sort((a, b) => (progress.get(b.id)?.lastPractised || '').localeCompare(progress.get(a.id)?.lastPractised || ''));
  if (active[0]) return active[0];
  const waiting = spine.filter(open);
  if (!waiting.length) return course.order.find((module) => !module.ongoing && open(module)) || null;
  const lastByStrand = new Map<string, string>();
  for (const row of progress.values()) {
    const strand = course.module.get(row.moduleId)?.strand;
    if (strand && (row.lastPractised || '') > (lastByStrand.get(strand) || '')) lastByStrand.set(strand, row.lastPractised || '');
  }
  return [...waiting].sort((a, b) => (lastByStrand.get(a.strand) || '').localeCompare(lastByStrand.get(b.strand) || '')
    || course.order.indexOf(a) - course.order.indexOf(b))[0] || null;
}

export function revisitsDue(course: Course, progress: ProgressMap, day: string): Module[] {
  return [...progress.values()]
    .filter((row) => row.firstPass && row.revisitDue && row.revisitDue <= day)
    .sort((a, b) => (a.revisitDue || '').localeCompare(b.revisitDue || ''))
    .map((row) => course.module.get(row.moduleId))
    .filter((module): module is Module => Boolean(module))
    .slice(0, MAX_REVISITS_PER_SESSION);
}

// What one logged attempt does to a module's progress.
export function applyAttempt(
  module: Module,
  previous: Progress | undefined,
  checks: Record<number, CheckAnswer>,
  day: string,
  revisit: boolean,
): Progress {
  const row: Progress = previous ? { ...previous } : {
    moduleId: module.id, started: day, lastPractised: null, firstPass: null, passed: null,
    revisitDue: null, revisitDays: 0, weak: false,
  };
  row.lastPractised = day;
  const asked = revisit && module.revisit?.checks.length ? module.revisit.checks : module.done_when.map((_, index) => index);
  const answered = asked.filter((index) => checks[index] !== undefined);
  if (!answered.length) return row;
  const allYes = asked.every((index) => checks[index] === 'yes');
  if (!allYes) {
    // Not yet: come back to it soon, and if this was a revisit, mark the module as weak.
    if (row.firstPass) {
      row.revisitDays = REVISIT_DAYS[0]!;
      row.revisitDue = addDays(day, row.revisitDays);
      row.weak = revisit || row.weak;
    }
    return row;
  }
  if (!row.firstPass) {
    row.firstPass = day;
    row.revisitDays = REVISIT_DAYS[0]!;
  } else {
    if (!row.passed && day > row.firstPass) row.passed = day;
    const next = REVISIT_DAYS.find((days) => days > row.revisitDays);
    row.revisitDays = next ?? REVISIT_DAYS[REVISIT_DAYS.length - 1]!;
    row.weak = false;
  }
  row.revisitDue = addDays(day, row.revisitDays);
  return row;
}

// ---- Today's session -------------------------------------------------------------------------

export type StepKind = 'warm-up' | 'revisit' | 'exercise' | 'play' | 'log';

export interface Step {
  kind: StepKind;
  title: string;
  description: string;
  minutes: number;
  timer: Timer;
  reference: PracticeReference;
  moduleId: string | null;
  practiceId: string | null;
}

export interface Plan {
  title: string;
  minutes: number;
  focus: string;
  steps: Step[];
  module: Module | null;
  short: boolean;
}

const NO_REFERENCE: PracticeReference = { kind: 'none', query: null, tool: null, site: null, url: null };
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function weekday(day: string): string {
  return WEEKDAYS[new Date(`${day}T12:00:00Z`).getUTCDay()]!;
}

// The warm-up: a timed gesture ladder from an open ongoing module, or a line drill.
function warmUp(course: Course, progress: ProgressMap, minutes: number): Step | null {
  const open = course.order.filter((module) => module.ongoing && statusOf(module, progress) !== 'locked');
  const pick = (test: (practice: Practice) => boolean) => {
    for (const module of open) {
      const practice = module.practice.find(test);
      if (practice) return { module, practice };
    }
    return null;
  };
  const found = pick((practice) => practice.timer.mode === 'ladder') || pick((practice) => practice.kind === 'drill');
  if (!found) return null;
  const { module, practice } = found;
  return {
    kind: 'warm-up', title: practice.title, description: practice.description, minutes,
    timer: fitTimer(practice.timer, minutes), reference: practice.reference, moduleId: module.id, practiceId: practice.id,
  };
}

// Shrinks a ladder to fit the minutes, shortest poses first, so a warm-up is always on time.
export function fitTimer(timer: Timer, minutes: number): Timer {
  if (timer.mode === 'single') return { mode: 'single', minutes };
  const steps: { count: number; seconds: number }[] = [];
  let left = minutes * 60;
  for (const step of timer.steps) {
    const count = Math.min(step.count, Math.floor(left / step.seconds));
    if (count > 0) steps.push({ count, seconds: step.seconds });
    left -= count * step.seconds;
  }
  return steps.length ? { mode: 'ladder', steps } : { mode: 'single', minutes };
}

export function timerSeconds(timer: Timer): number {
  return timer.mode === 'single' ? timer.minutes * 60 : timer.steps.reduce((sum, step) => sum + step.count * step.seconds, 0);
}

// The next practice item of a module: the first one not yet logged, then round again.
export function nextPractice(module: Module, logged: Set<string>): Practice | null {
  const items = module.practice.filter((practice) => practice.kind !== 'benchmark');
  return items.find((practice) => !logged.has(practice.id)) || items[0] || null;
}

// A module without its own revisit task falls back to a short cold redraw of its first exercise.
export function revisitOf(module: Module): { title: string; description: string; minutes: number; checks: number[] } {
  return module.revisit || {
    title: module.practice[0]?.title || module.title,
    description: 'Draw it again from memory with the lesson closed, on a new subject, then compare.',
    minutes: 5,
    checks: module.done_when.map((_, index) => index),
  };
}

function revisitStep(module: Module): Step {
  const revisit = revisitOf(module);
  return {
    kind: 'revisit', title: `Revisit: ${revisit.title}`, description: revisit.description,
    minutes: revisit.minutes, timer: { mode: 'single', minutes: revisit.minutes },
    reference: { ...NO_REFERENCE, kind: 'memory' }, moduleId: module.id, practiceId: null,
  };
}

function logStep(minutes: number, module: Module | null): Step {
  return {
    kind: 'log', title: 'Photograph the page and check it',
    description: module ? `Answer the checks for ${module.title}, then add one line on what to fix next time.` : 'Add one line on what to fix next time.',
    minutes, timer: { mode: 'single', minutes }, reference: NO_REFERENCE, moduleId: module?.id || null, practiceId: null,
  };
}

function inventionStep(course: Course, progress: ProgressMap, module: Module | null, minutes: number): Step {
  const play = course.order.find((entry) => entry.track === 'play' && statusOf(entry, progress) !== 'locked'
    && entry.practice.some((practice) => practice.reference.kind === 'prompt'));
  const practice = play?.practice.find((item) => item.reference.kind === 'prompt') || null;
  return {
    kind: 'play',
    title: module ? `Invent with ${module.title.toLowerCase()}` : 'Draw something invented',
    description: module
      ? `Roll a prompt and draw it using what ${module.title.toLowerCase()} is teaching. No erasing, no reference, no tutorials.`
      : practice?.description || 'Roll a prompt and draw it. No erasing, no reference, no tutorials.',
    minutes, timer: { mode: 'single', minutes }, reference: { ...NO_REFERENCE, kind: 'prompt' },
    moduleId: play?.id || null, practiceId: practice?.id || null,
  };
}

export interface PlanInput {
  course: Course;
  progress: ProgressMap;
  logged: Set<string>;
  day: string;
  templateId: string;
  chosenModule?: string | null;
  short?: boolean;
  minutesOverride?: number | null;
}

export function planFor(slot: TemplateSession | null, input: PlanInput): Plan {
  const { course, progress, logged, day } = input;
  const module = currentModule(course, progress, input.chosenModule ?? null);
  const due = revisitsDue(course, progress, day);
  if (input.short) {
    const steps: Step[] = [];
    const warm = warmUp(course, progress, 5);
    if (warm) steps.push(warm);
    const firstDue = due[0];
    if (firstDue) steps.push({ ...revisitStep(firstDue), minutes: 5, timer: { mode: 'single', minutes: 5 } });
    else if (module) {
      const practice = nextPractice(module, logged);
      if (practice) steps.push({ kind: 'exercise', title: practice.title, description: practice.description, minutes: 5, timer: { mode: 'single', minutes: 5 }, reference: practice.reference, moduleId: module.id, practiceId: practice.id });
    }
    return { title: 'A short session', minutes: course.data.short_session.minutes, focus: course.data.short_session.description, steps, module, short: true };
  }

  const minutes = input.minutesOverride || slot?.minutes || 30;
  const kind = slot?.kind || 'module';
  const steps: Step[] = [];
  const warmMinutes = minutes >= 60 ? 10 : 5;
  const warm = warmUp(course, progress, warmMinutes);
  if (warm) steps.push(warm);
  let left = minutes - (warm ? warmMinutes : 0);
  const logMinutes = minutes >= 45 ? 5 : 3;
  left -= logMinutes;
  for (const revisit of due.slice(0, kind === 'review' ? 2 : 1)) {
    const minutesNeeded = revisitOf(revisit).minutes;
    if (left - minutesNeeded < 10) break;
    steps.push(revisitStep(revisit));
    left -= minutesNeeded;
  }
  if (kind === 'invention') {
    steps.push(inventionStep(course, progress, module, left));
  } else if (module) {
    const practice = nextPractice(module, logged);
    if (practice) {
      steps.push({
        kind: 'exercise', title: practice.title, description: practice.description, minutes: left,
        timer: practice.timer.mode === 'ladder' ? fitTimer(practice.timer, left) : { mode: 'single', minutes: left },
        reference: practice.reference, moduleId: module.id, practiceId: practice.id,
      });
    }
  }
  steps.push(logStep(logMinutes, module));
  const title = kind === 'invention' ? 'Draw something invented'
    : module ? (steps.find((step) => step.kind === 'exercise')?.title || module.title) : 'Practice';
  return { title, minutes, focus: slot?.focus || '', steps, module, short: false };
}

export function slotFor(course: Course, templateId: string, day: string): TemplateSession | null {
  const template = course.data.weekly_templates.find((entry) => entry.id === templateId) || course.data.weekly_templates[0];
  return template?.sessions.find((session) => session.day === weekday(day)) || null;
}
