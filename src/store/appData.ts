import { createContext, useContext } from 'react';
import type { LessonRecord, LogEntry } from '../engine/review';
import type { Settings } from './db';

export interface AppData {
  records: Map<string, LessonRecord>;
  log: LogEntry[];
  settings: Settings;
}

export const AppDataContext = createContext<AppData | null>(null);

export function useAppData(): AppData {
  const data = useContext(AppDataContext);
  if (!data) throw new Error('useAppData outside AppDataContext');
  return data;
}

export type LessonStatus = 'not started' | 'tried' | 'done' | 'known';

export function lessonStatus(record: LessonRecord | undefined): LessonStatus {
  if (!record) return 'not started';
  if (record.known) return 'known';
  return record.state;
}
