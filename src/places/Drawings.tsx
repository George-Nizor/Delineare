import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { useContent } from '../content/load';
import { go, href } from '../router';
import { db } from '../store/db';
import { BlobImage, shortDate } from '../ui/Thumb';
import { Icon } from '../ui/Icons';
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
        <h1>Sketchbook</h1>
        <p className="lede">{pages.length
          ? `Photos of the pages you've drawn, newest first, with the checks that held on each. Pick a lesson to see your first attempt next to your latest.`
          : `Photos of the pages you've drawn will appear here. When you finish an exercise, take a photo of your page and save it.`}</p>
      </header>
      {lessons.length > 1 ? (
        <label className="select">
          <span>Lesson</span>
          <select value={lesson} onChange={(event) => setLesson(event.target.value)}>
            <option value="">Every lesson</option>
            {lessons.map((slug) => <option key={slug} value={slug}>Lesson {content.lessons[slug]!.number}, {content.lessons[slug]!.title}</option>)}
          </select>
        </label>
      ) : null}
      {lesson && first && latest && first.id !== latest.id ? (
        <section className="compare" aria-labelledby="compare-title">
          <h2 id="compare-title">Lesson {content.lessons[lesson]!.number}, {content.lessons[lesson]!.title}: your first page and your latest</h2>
          <figure><BlobImage blob={first.photo} alt="Your first page for this lesson" /><figcaption>First page, {shortDate(first.createdAt)}</figcaption></figure>
          <figure><BlobImage blob={latest.photo} alt="Your latest page for this lesson" /><figcaption>Latest page, {shortDate(latest.createdAt)}</figcaption></figure>
        </section>
      ) : null}
      <ul className="page-grid stagger">
        {shown.map((page) => (
          <li key={page.id}>
            <a href={href('sketchbook', page.id!)}>
              <BlobImage blob={page.thumb} alt="" />
              <span className="page-caption">
                <span>{content.practice[page.practiceId]?.title ?? 'Drawing prompt'}</span>
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
    <div className="page drawing narrow">
      <a className="back-link" href={href('sketchbook')}><Icon name="back" size={16} />Sketchbook</a>
      <h1>{item?.title ?? 'Drawing prompt'}</h1>
      <p className="meta">{shortDate(page.createdAt)}{lesson ? <> · <a href={href('lesson', lesson.slug)}>Lesson {lesson.number}, {lesson.title}</a></> : null}</p>
      <BlobImage blob={page.photo} alt="Your page" className="drawing-photo" />
      {checks.length ? (
        <ul className="held">
          {checks.map((check, i) => (
            <li key={i} className={page.checksHeld.includes(i) ? 'yes' : 'no'}>
              <span className="held-mark">{page.checksHeld.includes(i) ? <Icon name="check" size={16} /> : null}{page.checksHeld.includes(i) ? 'Held' : 'Not yet'}</span> <InlineText nodes={check} />
            </li>
          ))}
        </ul>
      ) : null}
      <div className="actions">
        {confirming ? (
          <>
            <button type="button" className="button danger" onClick={async () => { await db.pages.delete(id); go('sketchbook'); }}>Delete this page</button>
            <button type="button" className="quiet" onClick={() => setConfirming(false)}>Keep it</button>
          </>
        ) : (
          <button type="button" className="quiet" onClick={() => setConfirming(true)}>Delete</button>
        )}
      </div>
    </div>
  );
}
