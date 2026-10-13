import { describe, expect, it } from 'vitest';
import { indexCourse } from '../src/data/load';
import type { Curriculum, Module } from '../src/data/types';
import { addDays, applyAttempt, currentModule, fitTimer, planFor, revisitsDue, statusOf, timerSeconds, type ProgressMap } from '../src/engine/plan';
import type { Progress } from '../src/store/db';
import { makePrompt, seeded } from '../src/references/prompts';

function module(id: string, extra: Partial<Module> = {}): Module {
  return {
    id, title: id, phase: 1, strand: 'construct', tier: 'essential', track: 'core', spine: true, ongoing: false,
    summary: '', prerequisites: [], est_hours: [1, 2], ongoing_hours: null, learning_outcomes: [], lesson: null, resources: [],
    practice: [{ id: `${id}.p1`, title: `${id} exercise`, description: 'Draw it.', dose: '1 page', minutes: 20, kind: 'exercise',
      timer: { mode: 'single', minutes: 20 }, reference: { kind: 'none', query: null, tool: null, site: null, url: null } }],
    revisit: { title: 'Again', description: 'From memory', minutes: 5, checks: [0] },
    done_when: [{ text: 'It holds', kind: 'judgement' }, { text: 'It reads', kind: 'judgement' }],
    common_mistakes: [], free_coverage: 'strong', from: [], ...extra,
  };
}

function course(modules: Module[]) {
  const data: Curriculum = {
    version: 2,
    meta: { title: 't', generated: '2026-10-13', module_count: modules.length, resource_count: 0, unverified_resources: 0, hours_spine: [1, 2], hours_all: [1, 2], known_gaps: [] },
    strands: [], phases: [{ number: 1, title: 'One', summary: '', module_ids: modules.map((entry) => entry.id) }],
    modules, resources: [], providers: [], syllabi: [], library: [], consensus: null, benchmarks: [],
    weekly_templates: [{ id: 't3', name: '3 h', hours_per_week: 3, description: '', sessions: [{ day: 'Monday', minutes: 30, focus: 'Lesson', kind: 'module' }] }],
    short_session: { minutes: 10, description: 'warm-up plus one revisit' },
  };
  return indexCourse(data);
}

const progressOf = (...rows: Progress[]): ProgressMap => new Map(rows.map((row) => [row.moduleId, row]));

describe('module status', () => {
  const lines = module('lines');
  const boxes = module('boxes', { prerequisites: ['lines'] });
  it('locks a module until its prerequisites have passed their checks once', () => {
    expect(statusOf(lines, new Map())).toBe('available');
    expect(statusOf(boxes, new Map())).toBe('locked');
    const once = applyAttempt(lines, undefined, { 0: 'yes', 1: 'yes' }, '2026-10-13', false);
    expect(statusOf(boxes, progressOf(once))).toBe('available');
  });

  it('counts a module as done only when the checks hold again on a later day', () => {
    const first = applyAttempt(lines, undefined, { 0: 'yes', 1: 'yes' }, '2026-10-13', false);
    expect(first.firstPass).toBe('2026-10-13');
    expect(first.passed).toBeNull();
    const sameDay = applyAttempt(lines, first, { 0: 'yes', 1: 'yes' }, '2026-10-13', false);
    expect(sameDay.passed).toBeNull();
    const later = applyAttempt(lines, sameDay, { 0: 'yes' }, '2026-10-16', true);
    expect(later.passed).toBe('2026-10-16');
    expect(statusOf(lines, progressOf(later))).toBe('passed');
  });

  it('spaces revisits out when they hold and brings them back soon when they do not', () => {
    const first = applyAttempt(lines, undefined, { 0: 'yes', 1: 'yes' }, '2026-10-13', false);
    expect(first.revisitDue).toBe(addDays('2026-10-13', 2));
    const held = applyAttempt(lines, first, { 0: 'yes' }, '2026-10-15', true);
    expect(held.revisitDays).toBe(7);
    const slipped = applyAttempt(lines, held, { 0: 'not-yet' }, '2026-10-22', true);
    expect(slipped.revisitDays).toBe(2);
    expect(slipped.weak).toBe(true);
    expect(slipped.revisitDue).toBe('2026-10-24');
  });

  it('never queues more than two revisits for one session', () => {
    const modules = ['a', 'b', 'c'].map((id) => module(id));
    const rows = modules.map((entry) => ({ ...applyAttempt(entry, undefined, { 0: 'yes', 1: 'yes' }, '2026-10-01', false) }));
    expect(revisitsDue(course(modules), progressOf(...rows), '2026-10-20')).toHaveLength(2);
  });
});

describe('the plan', () => {
  it('chooses the module being worked on, then the first open spine module', () => {
    const lines = module('lines');
    const shapes = module('shapes', { strand: 'observe' });
    const built = course([lines, shapes]);
    expect(currentModule(built, new Map())?.id).toBe('lines');
    const started: Progress = { moduleId: 'shapes', started: '2026-10-10', lastPractised: '2026-10-12', firstPass: null, passed: null, revisitDue: null, revisitDays: 0, weak: false };
    expect(currentModule(built, progressOf(started))?.id).toBe('shapes');
  });

  it('fits a session to its minutes and ends with a check', () => {
    const gesture = module('gesture', { ongoing: true, practice: [{ id: 'gesture.p1', title: 'Gesture ladder', description: 'Poses', dose: '', minutes: 20, kind: 'drill',
      timer: { mode: 'ladder', steps: [{ count: 10, seconds: 30 }, { count: 6, seconds: 60 }] }, reference: { kind: 'pose-site', query: null, tool: null, site: null, url: null } }] });
    const built = course([gesture, module('lines')]);
    const plan = planFor({ day: 'Monday', minutes: 30, focus: 'Lesson', kind: 'module' }, { course: built, progress: new Map(), logged: new Set(), day: '2026-10-12', templateId: 't3' });
    expect(plan.steps.map((step) => step.kind)).toEqual(['warm-up', 'exercise', 'log']);
    expect(plan.steps.reduce((sum, step) => sum + step.minutes, 0)).toBe(30);
    expect(timerSeconds(plan.steps[0]!.timer)).toBeLessThanOrEqual(5 * 60);
  });

  it('shrinks a gesture ladder from the short poses up', () => {
    expect(fitTimer({ mode: 'ladder', steps: [{ count: 10, seconds: 30 }, { count: 6, seconds: 60 }] }, 5)).toEqual({ mode: 'ladder', steps: [{ count: 10, seconds: 30 }] });
    expect(fitTimer({ mode: 'single', minutes: 30 }, 12)).toEqual({ mode: 'single', minutes: 12 });
  });
});

describe('prompts', () => {
  it('are repeatable from a seed and never pair a thing with itself', () => {
    expect(makePrompt(seeded(7)).text).toBe(makePrompt(seeded(7)).text);
    for (let seed = 1; seed < 200; seed += 1) {
      const prompt = makePrompt(seeded(seed));
      expect(prompt.parts[0]).not.toBe(prompt.parts[1]);
      expect(prompt.text).not.toMatch(/[–—]/);
    }
  });
});
