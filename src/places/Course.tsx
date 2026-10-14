import { useState } from 'react';
import { TOTAL_LESSONS, useContent, writtenLessons } from '../content/load';
import { drawingFor, iconFor } from '../content/art';
import type { LessonEntry } from '../content/types';
import { currentLesson } from '../engine/review';
import { href } from '../router';
import { lessonStatus, useAppData } from '../store/appData';
import { Icon } from '../ui/Icons';
import { Reveal } from '../ui/Reveal';

type Show = 'all' | 'open';

export function Course() {
  const content = useContent();
  const { records } = useAppData();
  const [query, setQuery] = useState('');
  const [show, setShow] = useState<Show>('all');
  const written = writtenLessons(content);
  const current = currentLesson(written.map((lesson) => lesson.slug), records);
  const q = query.trim().toLowerCase();

  const keep = (entry: LessonEntry) => {
    const status = lessonStatus(records.get(entry.slug));
    if (show === 'open' && (status === 'done' || status === 'known')) return false;
    return !q || `${entry.number} ${entry.title} ${entry.summary}`.toLowerCase().includes(q);
  };
  const parts = content.parts.map((part) => ({ ...part, shown: part.lessons.filter(keep) })).filter((part) => part.shown.length);

  return (
    <div className="page course">
      <header className="page-head">
        <h1>Course</h1>
        <p className="lede">There are {TOTAL_LESSONS(content)} lessons in {content.parts.length} parts, starting with straight lines and ending with a whole scene drawn from imagination. They're in the order we recommend, but every lesson is open, so you can start wherever you like.</p>
      </header>

      <div className="toolbar">
        <label className="field search-field">
          <Icon name="search" size={18} />
          <span className="visually-hidden">Find a lesson</span>
          <input type="search" placeholder="Find a lesson" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className="segmented" role="group" aria-label="Which lessons">
          <button type="button" aria-pressed={show === 'all'} onClick={() => setShow('all')}>All lessons</button>
          <button type="button" aria-pressed={show === 'open'} onClick={() => setShow('open')}>Not done yet</button>
        </div>
      </div>

      {parts.length ? null : <p className="empty">No lessons match that.</p>}

      {parts.map((part) => (
        <section key={part.number} className="course-part" aria-labelledby={`part-${part.number}`}>
          <div className="part-head">
            <h2 id={`part-${part.number}`}>Part {part.number}: {part.title}</h2>
            <span className="meta">{part.lessons.length} lessons</span>
          </div>
          <ol className="lesson-grid">
            {part.shown.map((entry) => <LessonCard key={entry.slug} entry={entry} current={entry.slug === current} />)}
          </ol>
        </section>
      ))}
    </div>
  );
}

function LessonCard({ entry, current }: { entry: LessonEntry; current: boolean }) {
  const content = useContent();
  const { records } = useAppData();
  const status = lessonStatus(records.get(entry.slug));
  const drawing = drawingFor(entry.slug);
  const lesson = content.lessons[entry.slug];
  const video = lesson?.watch.map((id) => content.resources[id]).find(Boolean);
  const badge = current ? 'Next' : status === 'done' ? 'Done' : status === 'known' ? 'Known' : status === 'tried' ? 'In progress' : '';

  const body = (
    <>
      <span className={`lesson-art ${drawing ? 'is-drawing' : 'is-icon'}`}>
        <img src={drawing ? drawing.src : iconFor(entry.number)} alt="" />
        {badge ? <span className={`badge ${current ? 'badge-next' : ''}`}>{badge}</span> : null}
      </span>
      <span className="lesson-card-body">
        <span className="lesson-card-title"><span className="num">{entry.number}</span>{entry.title}</span>
        <span className="card-text">{entry.summary}</span>
        {video ? <span className="card-meta video-line"><Icon name="library" size={15} />{video.teacher}{video.minutes ? ` · ${video.minutes} min` : ''}</span> : null}
        {drawing ? <span className="credit">Drawing: {drawing.credit}</span> : null}
      </span>
    </>
  );

  return (
    <Reveal as="li" className={`lesson-card ${current ? 'current' : ''}`}>
      {entry.written ? <a className="card" href={href('lesson', entry.slug)}>{body}</a> : <div className="card unwritten" aria-label={`${entry.title}, being written`}>{body}</div>}
    </Reveal>
  );
}
