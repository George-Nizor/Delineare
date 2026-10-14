// Everything Delineare stores, in this browser's IndexedDB on this computer. Nothing is sent
// anywhere. The first build used a different database; this one starts empty.
import Dexie, { type Table } from 'dexie';
import type { LessonRecord, LogEntry } from '../engine/review';

export interface Page {
  id?: number;
  createdAt: number;
  lesson: string;
  practiceId: string;
  photo: Blob;
  thumb: Blob;
  width: number;
  height: number;
  // Indexes of the checks that held when the page was saved.
  checksHeld: number[];
  checkCount: number;
}

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  theme: Theme;
  // Whether lesson steps start folded away, for learners who only want the goal and the check.
  foldSteps: boolean;
  sound: boolean;
  // Set once the learner has picked a way in from the welcome page.
  welcomed: boolean;
  // Cuts transitions and the opening animation down to a fade, whatever the computer's setting.
  reduceMotion: boolean;
}

export const DEFAULT_SETTINGS: Settings = { theme: 'system', foldSteps: false, sound: true, welcomed: false, reduceMotion: false };

class DelineareDB extends Dexie {
  pages!: Table<Page, number>;
  log!: Table<LogEntry, number>;
  lessons!: Table<LessonRecord, string>;
  settings!: Table<{ key: string; value: unknown }, string>;

  constructor() {
    super('delineare-2');
    this.version(1).stores({
      pages: '++id, createdAt, lesson, practiceId',
      log: '++id, practiceId, lesson, at',
      lessons: 'slug',
      settings: 'key',
    });
  }
}

export const db = new DelineareDB();

export async function readSettings(): Promise<Settings> {
  const rows = await db.settings.toArray();
  const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  return { ...DEFAULT_SETTINGS, ...stored } as Settings;
}

export async function saveSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void> {
  await db.settings.put({ key, value });
}

// Records a finished exercise: the log entry, the page if there is one, and the lesson's state.
// The main exercise with every check held marks the lesson done.
export async function recordExercise(input: {
  practiceId: string;
  lesson: string;
  main: boolean;
  page?: Omit<Page, 'id' | 'createdAt' | 'lesson' | 'practiceId'>;
  allChecksHeld: boolean;
  now?: number;
}): Promise<number | undefined> {
  const now = input.now ?? Date.now();
  return db.transaction('rw', db.pages, db.log, db.lessons, async () => {
    const pageId = input.page ? await db.pages.add({ ...input.page, createdAt: now, lesson: input.lesson, practiceId: input.practiceId }) : undefined;
    await db.log.add({ practiceId: input.practiceId, lesson: input.lesson, at: now, pageId });
    if (input.main) {
      const existing = await db.lessons.get(input.lesson);
      const record: LessonRecord = existing ?? { slug: input.lesson, state: 'tried', known: false, triedAt: now };
      if (input.allChecksHeld && record.state !== 'done') {
        record.state = 'done';
        record.doneAt = now;
      }
      await db.lessons.put(record);
    }
    return pageId;
  });
}

export async function setKnown(slug: string, known: boolean): Promise<void> {
  const now = Date.now();
  const existing = await db.lessons.get(slug);
  // Taking "I know this" back on a lesson that was never practised leaves no record behind.
  if (!known && existing && existing.state === 'tried' && !(await db.log.where('lesson').equals(slug).count())) {
    await db.lessons.delete(slug);
    return;
  }
  const record: LessonRecord = existing ?? { slug, state: 'tried', known: false, triedAt: now };
  record.known = known;
  record.knownAt = known ? now : undefined;
  await db.lessons.put(record);
}

export async function deleteEverything(): Promise<void> {
  await db.transaction('rw', db.pages, db.log, db.lessons, db.settings, async () => {
    await Promise.all([db.pages.clear(), db.log.clear(), db.lessons.clear(), db.settings.clear()]);
  });
}
