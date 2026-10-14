import { createContext, useContext } from 'react';
import type { Content, Lesson, PracticeItem } from './types';

export async function loadContent(): Promise<Content> {
  const response = await fetch('./content.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error(`The course could not be loaded (${response.status}).`);
  const content = (await response.json()) as Content;
  if (content.format !== 1) throw new Error('The course file is from a different version of Delineare.');
  return content;
}

export const ContentContext = createContext<Content | null>(null);

export function useContent(): Content {
  const content = useContext(ContentContext);
  if (!content) throw new Error('useContent outside ContentContext');
  return content;
}

// Written lessons in course order.
export function writtenLessons(content: Content): Lesson[] {
  return content.parts.flatMap((part) => part.lessons).filter((entry) => entry.written).map((entry) => content.lessons[entry.slug]!);
}

// Each written lesson's practice ids, its main exercise first.
export function practiceByLesson(content: Content): Map<string, string[]> {
  return new Map(writtenLessons(content).map((lesson) => [lesson.slug, [lesson.exercise, ...lesson.practice.filter((id) => id !== lesson.exercise)]]));
}

export function practiceItem(content: Content, id: string): PracticeItem | undefined {
  return content.practice[id];
}

export const TOTAL_LESSONS = (content: Content) => content.parts.reduce((sum, part) => sum + part.lessons.length, 0);
