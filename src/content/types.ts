// The shape of public/content.json, written by scripts/build-content.mjs.

export type InlineNode =
  | { t: 'text'; v: string }
  | { t: 'code'; v: string }
  | { t: 'strong'; c: InlineNode[] }
  | { t: 'em'; c: InlineNode[] }
  | { t: 'link'; href: string; c: InlineNode[] };

export type Inline = InlineNode[];

export interface LessonEntry {
  slug: string;
  number: number;
  part: number;
  title: string;
  summary: string;
  written: boolean;
}

export interface Part {
  number: number;
  title: string;
  lessons: LessonEntry[];
}

export interface Step {
  title: string;
  text: Inline;
  diagram: string | null;
}

export interface Lesson {
  slug: string;
  number: number;
  part: number;
  title: string;
  summary: string;
  intro: Inline[];
  needs: string[];
  example: string | null;
  steps: Step[];
  howNotes: Inline[];
  mistake: { diagram: string | null; text: Inline[] } | null;
  checkIntro: Inline[];
  checks: Inline[];
  checkNotes: Inline[];
  watch: string[];
  exercise: string;
  practice: string[];
  prose: number;
}

export type PracticeKind = 'drill' | 'warm-up' | 'timed' | 'memory' | 'life' | 'imagination' | 'location' | 'master-copy' | 'retest';

export interface Round {
  label: string;
  seconds: number;
}

export type Reference =
  | { type: 'none' }
  | { type: 'diagram'; diagram: string }
  | { type: 'prompt'; prompt: string };

export interface PracticeItem {
  id: string;
  lesson: string;
  main: boolean;
  title: string;
  kind: PracticeKind;
  minutes: number;
  text: Inline[];
  steps: string[];
  rounds: Round[];
  reference: Reference;
  check: Inline[];
}

export interface Resource {
  id: string;
  title: string;
  teacher: string;
  url: string;
  kind: string;
  minutes: number | null;
  youtube: string | null;
  cost: 'free' | 'paid';
  checked: string;
}

export interface Diagram {
  id: string;
  svg: string;
  alt: string;
}

export interface Prompts {
  subjects: string[];
  twists: string[];
  views: string[];
}

export interface Content {
  format: 1;
  parts: Part[];
  lessons: Record<string, Lesson>;
  practice: Record<string, PracticeItem>;
  resources: Record<string, Resource>;
  diagrams: Record<string, Diagram>;
  prompts: Prompts;
}

export const KIND_LABEL: Record<PracticeKind, string> = {
  drill: 'Drill',
  'warm-up': 'Warm-up',
  timed: 'Timed poses',
  memory: 'Memory',
  life: 'From life',
  imagination: 'Imagination',
  location: 'On location',
  'master-copy': 'Master copy',
  retest: 'Retest',
};
