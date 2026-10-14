import { useState } from 'react';
import { TOTAL_LESSONS, useContent, writtenLessons } from '../content/load';
import { currentLesson } from '../engine/review';
import { href } from '../router';
import { lessonStatus, useAppData } from '../store/appData';

const STATUS_LABEL = { 'not started': '', tried: 'Tried', done: 'Done', known: 'Known' } as const;

export function Course() {
  const content = useContent();
  const { records } = useAppData();
  const written = writtenLessons(content);
  const current = currentLesson(written.map((lesson) => lesson.slug), records);
  const currentPart = (current && content.lessons[current]?.part) || 1;
  const [open, setOpen] = useState<Set<number>>(() => new Set([currentPart]));
  const toggle = (part: number) => setOpen((previous) => {
    const next = new Set(previous);
    if (next.has(part)) next.delete(part);
    else next.add(part);
    return next;
  });

  return (
    <div className="page course">
      <header className="page-head">
        <h1>The course</h1>
        <p className="lede">{TOTAL_LESSONS(content)} lessons in {content.parts.length} parts. {written.length} are written so far; the rest follow in updates.</p>
      </header>
      <ol className="parts">
        {content.parts.map((part) => {
          const done = part.lessons.filter((entry) => ['done', 'known'].includes(lessonStatus(records.get(entry.slug)))).length;
          const isOpen = open.has(part.number);
          return (
            <li key={part.number} className={`part ${isOpen ? 'open' : ''}`}>
              <button type="button" className="part-head" aria-expanded={isOpen} onClick={() => toggle(part.number)}>
                <span className="part-number">Part {part.number}</span>
                <span className="part-title">{part.title}</span>
                <span className="meta">{part.lessons.length} lessons{done ? `, ${done} done` : ''}</span>
              </button>
              {isOpen ? (
                <ol className="lessons">
                  {part.lessons.map((entry) => {
                    const status = lessonStatus(records.get(entry.slug));
                    const body = (
                      <>
                        <span className="lesson-number">{entry.number}</span>
                        <span className="lesson-text">
                          <span className="lesson-title">{entry.title}</span>
                          <span className="lesson-outcome">{entry.outcome.charAt(0).toUpperCase() + entry.outcome.slice(1)}</span>
                        </span>
                        <span className="lesson-status">{entry.slug === current ? 'Next' : entry.written ? STATUS_LABEL[status] : 'Later'}</span>
                      </>
                    );
                    return (
                      <li key={entry.slug} className={`lesson-row ${entry.written ? '' : 'unwritten'} ${entry.slug === current ? 'current' : ''} status-${status.replace(' ', '-')}`}>
                        {entry.written ? <a href={href('lesson', entry.slug)}>{body}</a> : <div aria-label={`${entry.title}, written in a later update`}>{body}</div>}
                      </li>
                    );
                  })}
                </ol>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
