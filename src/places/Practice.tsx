import { useState } from 'react';
import { practiceByLesson, useContent, writtenLessons } from '../content/load';
import { KIND_LABEL, type PracticeKind } from '../content/types';
import { daySeed, makePrompt } from '../engine/prompts';
import { suggest } from '../engine/review';
import { href } from '../router';
import { useAppData } from '../store/appData';
import { Suggestions } from './Suggestions';

const TIMES = [0, 5, 10, 20, 30] as const;

export function Practice() {
  const content = useContent();
  const { records, log } = useAppData();
  const [offset, setOffset] = useState(0);
  const [time, setTime] = useState<(typeof TIMES)[number]>(0);
  const [kind, setKind] = useState<PracticeKind | ''>('');

  const written = writtenLessons(content);
  const now = Date.now();
  const seed = daySeed(now) + offset;
  const items = suggest({ order: written.map((l) => l.slug), records, practice: practiceByLesson(content), log, now, prompt: makePrompt(content.prompts, seed) });
  const kinds = [...new Set(Object.values(content.practice).map((item) => item.kind))];
  const fits = (id: string) => {
    const item = content.practice[id]!;
    return (!time || item.minutes <= time) && (!kind || item.kind === kind);
  };

  return (
    <div className="page practice">
      <header className="page-head">
        <h1>Practise</h1>
        <p className="lede">Practice for every lesson, for whenever you have the time. Nothing here is due or missed.</p>
      </header>

      <section aria-labelledby="suggested-title">
        <h2 id="suggested-title">Suggested now</h2>
        <Suggestions items={items} seed={seed} onAnother={() => setOffset((value) => value + 1)} />
      </section>

      <section aria-labelledby="library-title">
        <h2 id="library-title">Everything</h2>
        <div className="filters">
          <div className="chips" role="group" aria-label="Time">
            {TIMES.map((value) => (
              <button key={value} type="button" className={`chip ${time === value ? 'on' : ''}`} aria-pressed={time === value} onClick={() => setTime(value)}>
                {value ? `Up to ${value} min` : 'Any length'}
              </button>
            ))}
          </div>
          <div className="chips" role="group" aria-label="Kind">
            <button type="button" className={`chip ${kind === '' ? 'on' : ''}`} aria-pressed={kind === ''} onClick={() => setKind('')}>Any kind</button>
            {kinds.map((value) => (
              <button key={value} type="button" className={`chip ${kind === value ? 'on' : ''}`} aria-pressed={kind === value} onClick={() => setKind(value)}>{KIND_LABEL[value]}</button>
            ))}
          </div>
        </div>
        {written.map((lesson) => {
          const ids = lesson.practice.filter(fits);
          if (!ids.length) return null;
          return (
            <div key={lesson.slug} className="library-group">
              <h3><a href={href('lesson', lesson.slug)}>Lesson {lesson.number}, {lesson.title}</a></h3>
              <ul className="practice-list">
                {ids.map((id) => {
                  const item = content.practice[id]!;
                  return (
                    <li key={id}>
                      <a href={href('do', id)}>
                        <span className="practice-title">{item.title}</span>
                        <span className="meta">{item.minutes} min · {KIND_LABEL[item.kind]}{item.main ? ' · the lesson exercise' : ''}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
