import { describe, expect, it } from 'vitest';
import { DAY, currentLesson, nextReview, suggest, type LessonRecord, type LogEntry } from '../src/engine/review';
import { makePrompt } from '../src/engine/prompts';

const order = ['lines', 'ellipses', 'contour'];
const practice = new Map([
  ['lines', ['lines-main', 'lines-warm', 'lines-super']],
  ['ellipses', ['ellipses-main', 'ellipses-warm']],
  ['contour', ['contour-main', 'contour-blind']],
]);
const record = (slug: string, fields: Partial<LessonRecord> = {}): [string, LessonRecord] => [slug, { slug, state: 'tried', known: false, triedAt: 0, ...fields }];
const entry = (practiceId: string, lesson: string, at: number): LogEntry => ({ practiceId, lesson, at });

describe('the lesson to continue', () => {
  it('is the first lesson that is neither done nor known', () => {
    expect(currentLesson(order, new Map())).toBe('lines');
    expect(currentLesson(order, new Map([record('lines', { state: 'done', doneAt: 1 })]))).toBe('ellipses');
    expect(currentLesson(order, new Map([record('lines', { known: true, knownAt: 1 }), record('ellipses')]))).toBe('ellipses');
  });

  it('is null once every written lesson is finished', () => {
    const all = new Map(order.map((slug) => record(slug, { state: 'done', doneAt: 1 })));
    expect(currentLesson(order, all)).toBeNull();
  });
});

describe('review timing', () => {
  it('waits 2 days, then 7, then 21, then 60 after each practice', () => {
    const done = record('lines', { state: 'done', doneAt: 0 })[1];
    expect(nextReview(done, [])).toBe(2 * DAY);
    expect(nextReview(done, [entry('lines-warm', 'lines', 3 * DAY)])).toBe(10 * DAY);
    expect(nextReview(done, [entry('a', 'lines', DAY), entry('b', 'lines', 9 * DAY)])).toBe(30 * DAY);
    expect(nextReview(done, [1, 2, 3, 4, 5].map((day) => entry('a', 'lines', day * DAY)))).toBe(65 * DAY);
  });

  it('never schedules a lesson that is not finished', () => {
    expect(nextReview(record('lines')[1], [])).toBeNull();
    expect(nextReview(undefined, [])).toBeNull();
  });
});

describe('suggestions', () => {
  const base = { order, practice, log: [] as LogEntry[], now: 100 * DAY, prompt: 'A teapot' };

  it('offers only a free drawing before any lesson is started', () => {
    expect(suggest({ ...base, records: new Map() })).toEqual([{ role: 'free', prompt: 'A teapot' }]);
  });

  it('offers an untried practice item from the lesson in progress', () => {
    const records = new Map([record('lines')]);
    const log = [entry('lines-main', 'lines', DAY)];
    expect(suggest({ ...base, records, log })[0]).toEqual({ role: 'continue', practiceId: 'lines-warm' });
  });

  it('offers a review when a finished lesson is due, and a warm-up when none is', () => {
    const records = new Map([record('lines', { state: 'done', doneAt: 0 }), record('ellipses')]);
    const due = suggest({ ...base, records, now: 3 * DAY });
    expect(due.map((s) => s.role)).toEqual(['continue', 'review', 'free']);
    expect(due[1]!.practiceId).toBe('lines-warm');
    const notDue = suggest({ ...base, records, now: DAY });
    expect(notDue.map((s) => s.role)).toEqual(['continue', 'warm-up', 'free']);
  });

  it('reviews the item practised longest ago', () => {
    const records = new Map([record('lines', { state: 'done', doneAt: 0 }), record('ellipses')]);
    const log = [entry('lines-warm', 'lines', DAY)];
    const out = suggest({ ...base, records, log, now: 20 * DAY });
    expect(out.find((s) => s.role === 'review')?.practiceId).toBe('lines-super');
  });
});

describe('prompts', () => {
  const prompts = { subjects: ['a teapot', 'an owl'], twists: ['made of stone'], views: ['from above'] };

  it('is stable for a seed and starts with a capital', () => {
    expect(makePrompt(prompts, 5)).toBe(makePrompt(prompts, 5));
    expect(makePrompt(prompts, 5)).toMatch(/^[A-Z]/);
  });

  it('always names a subject', () => {
    for (let seed = 0; seed < 50; seed += 1) expect(makePrompt(prompts, seed)).toMatch(/^(A teapot|An owl)/);
  });
});
