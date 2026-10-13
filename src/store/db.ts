import Dexie, { type EntityTable } from 'dexie';

// Everything Delineare remembers lives in this one IndexedDB database on this computer. Nothing is
// sent anywhere. Settings > Your data exports all of it as a zip and imports it again.

export type CheckAnswer = 'yes' | 'partly' | 'not-yet' | 'cant-tell';

export interface Setting {
  key: string;
  value: unknown;
}

// One row per module the learner has touched.
export interface Progress {
  moduleId: string;
  started: string; // ISO date
  lastPractised: string | null;
  // The first day every done-when check was answered yes, and the later day it held again.
  firstPass: string | null;
  passed: string | null;
  // Spaced revisits: when the next cold redraw is due and the interval that produced it.
  revisitDue: string | null;
  revisitDays: number;
  weak: boolean;
}

export interface SessionStepRecord {
  kind: string;
  title: string;
  moduleId: string | null;
  practiceId: string | null;
  minutes: number;
  done: boolean;
}

export interface SessionRecord {
  id?: number;
  date: string; // ISO timestamp
  plannedMinutes: number;
  spentSeconds: number;
  steps: SessionStepRecord[];
  short: boolean;
}

export interface Drawing {
  id?: number;
  date: string; // ISO timestamp
  moduleId: string | null;
  practiceId: string | null;
  sessionId: number | null;
  revisit: boolean;
  note: string;
  checks: Record<number, CheckAnswer>;
  photo: Blob | null; // resized, at most 2000 px on the long side
  thumb: Blob | null; // 480 px
  width: number;
  height: number;
  reference: ReferenceRecord | null;
}

// A reference image's identity and credit, stored with what was drawn from it.
export interface ReferenceRecord {
  source: string; // 'aic' | 'met' | 'cleveland' | 'builtin'
  id: string;
  title: string;
  creator: string;
  date: string;
  image: string;
  link: string;
  licence: string;
}

export interface CachedSearch {
  key: string; // source:query
  fetched: string;
  results: ReferenceRecord[];
}

export class DelineareDb extends Dexie {
  settings!: EntityTable<Setting, 'key'>;
  progress!: EntityTable<Progress, 'moduleId'>;
  sessions!: EntityTable<SessionRecord, 'id'>;
  drawings!: EntityTable<Drawing, 'id'>;
  searches!: EntityTable<CachedSearch, 'key'>;

  constructor(name = 'delineare') {
    super(name);
    this.version(1).stores({
      settings: 'key',
      progress: 'moduleId, lastPractised, revisitDue',
      sessions: '++id, date',
      drawings: '++id, date, moduleId, sessionId',
      searches: 'key, fetched',
    });
  }
}

export const db = new DelineareDb();

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await db.settings.get(key);
  return row === undefined ? fallback : (row.value as T);
}

export function setSetting(key: string, value: unknown): Promise<string> {
  return db.settings.put({ key, value });
}
