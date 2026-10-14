import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { TOTAL_LESSONS, practiceByLesson, useContent, writtenLessons } from '../content/load';
import { daySeed, makePrompt } from '../engine/prompts';
import { currentLesson, suggest } from '../engine/review';
import { href } from '../router';
import { useAppData } from '../store/appData';
import { db } from '../store/db';
import { BlobImage, shortDate } from '../ui/Thumb';
import { Suggestions } from './Suggestions';

export function Home() {
  const content = useContent();
  const { records, log } = useAppData();
  const [offset, setOffset] = useState(0);
  const lastPage = useLiveQuery(() => db.pages.orderBy('createdAt').last(), []);

  const written = writtenLessons(content);
  const order = written.map((lesson) => lesson.slug);
  const slug = currentLesson(order, records);
  const lesson = slug ? content.lessons[slug] : undefined;
  const record = slug ? records.get(slug) : undefined;
  const exercise = lesson ? content.practice[lesson.exercise] : undefined;
  const part = lesson ? content.parts[lesson.part - 1] : undefined;
  const now = Date.now();
  const seed = daySeed(now) + offset;
  const items = suggest({ order, records, practice: practiceByLesson(content), log, now, prompt: makePrompt(content.prompts, seed) });

  return (
    <div className="page home">
      <section className="continue" aria-labelledby="continue-title">
        {lesson && part ? (
          <>
            <p className="eyebrow">{record ? 'In progress' : `Lesson ${lesson.number} of ${TOTAL_LESSONS(content)}`} · {part.title}</p>
            <h1 id="continue-title" className="continue-title">{lesson.title}</h1>
            <p className="continue-outcome">After this you can {lesson.outcome}</p>
            <div className="actions">
              <a className="button primary" href={href('lesson', lesson.slug)}>{record ? 'Back to the lesson' : 'Start the lesson'}</a>
              {exercise && record ? <a className="button" href={href('do', exercise.id)}>Do the exercise again</a> : null}
              {exercise && !record ? <span className="meta">Exercise: {exercise.minutes} min</span> : null}
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">You have finished every written lesson</p>
            <h1 id="continue-title" className="continue-title">Lessons {written.length + 1} to {TOTAL_LESSONS(content)} come in later updates</h1>
            <p className="continue-outcome">Keep the skills you have with the practice below.</p>
          </>
        )}
      </section>

      <section aria-labelledby="practise-title">
        <h2 id="practise-title">Practise</h2>
        <Suggestions items={items} seed={seed} onAnother={() => setOffset((value) => value + 1)} />
        <p className="more"><a href={href('practice')}>Everything to practise</a></p>
      </section>

      {lastPage ? (
        <section aria-labelledby="last-title">
          <h2 id="last-title">Your last page</h2>
          <a className="last-page" href={href('drawings', lastPage.id!)}>
            <BlobImage blob={lastPage.thumb} alt="" className="last-page-image" />
            <span>
              <span className="last-page-title">{content.practice[lastPage.practiceId]?.title ?? 'Drawing for its own sake'}</span>
              <span className="meta">{shortDate(lastPage.createdAt)}</span>
            </span>
          </a>
        </section>
      ) : null}
    </div>
  );
}
