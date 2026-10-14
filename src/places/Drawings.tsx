import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useContent } from '../content/load';
import { go, href } from '../router';
import { db } from '../store/db';
import { BlobImage, shortDate } from '../ui/Thumb';
import { InlineText } from '../ui/Inline';
import { NotFound } from './Lesson';

export function Drawings() {
  const content = useContent();
  const [lesson, setLesson] = useState('');
  const pages = useLiveQuery(() => db.pages.orderBy('createdAt').reverse().toArray(), []);
  if (!pages) return null;
  const lessons = [...new Set(pages.map((page) => page.lesson))].filter((slug) => content.lessons[slug]);
  const shown = lesson ? pages.filter((page) => page.lesson === lesson) : pages;
  const first = shown.at(-1);
  const latest = shown[0];

  return (
    <div className="page drawings">
      <header className="page-head">
        <h1>Drawings</h1>
        <p className="lede">{pages.length ? `${pages.length} page${pages.length === 1 ? '' : 's'}, newest first.` : 'No drawings yet. Add a photo of your page when you finish an exercise.'}</p>
      </header>
      {lessons.length > 1 ? (
        <label className="select">
          <span>Show</span>
          <select value={lesson} onChange={(event) => setLesson(event.target.value)}>
            <option value="">Every lesson</option>
            {lessons.map((slug) => <option key={slug} value={slug}>Lesson {content.lessons[slug]!.number}, {content.lessons[slug]!.title}</option>)}
          </select>
        </label>
      ) : null}
      {lesson && first && latest && first.id !== latest.id ? (
        <section className="compare" aria-label="First and latest">
          <figure><BlobImage blob={first.photo} alt="Your first page for this lesson" /><figcaption>First, {shortDate(first.createdAt)}</figcaption></figure>
          <figure><BlobImage blob={latest.photo} alt="Your latest page for this lesson" /><figcaption>Latest, {shortDate(latest.createdAt)}</figcaption></figure>
        </section>
      ) : null}
      <ul className="page-grid">
        {shown.map((page) => (
          <li key={page.id}>
            <a href={href('drawings', page.id!)}>
              <BlobImage blob={page.thumb} alt="" />
              <span className="page-caption">
                <span>{content.practice[page.practiceId]?.title ?? 'Drawing for its own sake'}</span>
                <span className="meta">{shortDate(page.createdAt)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DrawingDetail({ id }: { id: number }) {
  const content = useContent();
  const [confirming, setConfirming] = useState(false);
  const page = useLiveQuery(() => db.pages.get(id), [id]);
  if (page === undefined) return null;
  if (!page) return <NotFound />;
  const item = content.practice[page.practiceId];
  const lesson = content.lessons[page.lesson];
  const checks = item?.main && lesson ? lesson.checks : item?.check ?? [];

  return (
    <div className="page drawing">
      <a className="quiet back" href={href('drawings')}>All drawings</a>
      <h1>{item?.title ?? 'Drawing for its own sake'}</h1>
      <p className="meta">{shortDate(page.createdAt)}{lesson ? <> · <a href={href('lesson', lesson.slug)}>Lesson {lesson.number}, {lesson.title}</a></> : null}</p>
      <BlobImage blob={page.photo} alt="Your page" className="drawing-photo" />
      {checks.length ? (
        <ul className="held">
          {checks.map((check, i) => (
            <li key={i} className={page.checksHeld.includes(i) ? 'yes' : 'no'}>
              <span className="held-mark">{page.checksHeld.includes(i) ? 'Held' : 'Not yet'}</span> <InlineText nodes={check} />
            </li>
          ))}
        </ul>
      ) : null}
      <div className="actions">
        {confirming ? (
          <>
            <button type="button" className="button danger" onClick={async () => { await db.pages.delete(id); go('drawings'); }}>Delete this page</button>
            <button type="button" className="quiet" onClick={() => setConfirming(false)}>Keep it</button>
          </>
        ) : (
          <button type="button" className="quiet" onClick={() => setConfirming(true)}>Delete</button>
        )}
      </div>
    </div>
  );
}
