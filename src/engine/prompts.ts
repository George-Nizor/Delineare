// Drawing prompts: a subject, often with a twist and a view. Seeded, so a prompt stays the same
// for a day and "Another" moves to the next one.
import type { Prompts } from '../content/types';
import { DAY } from './review';

export function seeded(seed: number): () => number {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function daySeed(now: number): number {
  return Math.floor(now / DAY);
}

export function makePrompt(prompts: Prompts, seed: number): string {
  const next = seeded(seed * 7919 + 17);
  const pick = (list: readonly string[]) => list[Math.floor(next() * list.length)] ?? '';
  const subject = pick(prompts.subjects);
  const twist = next() < 0.6 ? pick(prompts.twists) : '';
  const view = next() < 0.5 ? pick(prompts.views) : '';
  const text = [subject, twist, view].filter(Boolean).join(', ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
