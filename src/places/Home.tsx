import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { TOTAL_LESSONS, practiceByLesson, useContent, writtenLessons } from '../content/load';
import { daySeed, makePrompt } from '../engine/prompts';
import { currentLesson, suggest } from '../engine/review';
import { href } from '../router';
import { useAppData } from '../store/appData';
import { db } from '../store/db';
import { DiagramView } from '../ui/Diagram';
import { Icon, type IconName } from '../ui/Icons';
import { BlobImage, shortDate } from '../ui/Thumb';
import { Suggestions } from './Suggestions';

export function Home() {
  const content = useContent();
  const { records, log } = useAppData();
  const [offset, setOffset] = useState(0);
  const pageCount = useLiveQuery(() => db.pages.count(), []);
  const lastPage = useLiveQuery(() => db.pages.orderBy('createdAt').last(), []);

  const written = writtenLessons(content);
  const order = written.map((lesson) => lesson.slug);
  const slug = currentLesson(order, records);
  const lesson = slug ? content.lessons[slug] : undefined;
  const record = slug ? records.get(slug) : undefined;
  const exercise = lesson ? content.practice[lesson.exercise] : undefined;
  const now = Date.now();
  const seed = daySeed(now) + offset;
  const items = suggest({ order, records, practice: practiceByLesson(content), log, now, prompt: makePrompt(content.prompts, seed) });
  const exerciseCount = Object.keys(content.practice).length;
  const resourceCount = Object.keys(content.resources).length;

  const places: { route: string; icon: IconName; title: string; text: string }[] = [
    { route: 'course', icon: 'course', title: 'Course', text: `All ${TOTAL_LESSONS(content)} lessons. Work through them in order or go straight to the one you need.` },
    { route: 'practice', icon: 'practice', title: 'Practice', text: `${exerciseCount} exercises from every lesson, plus timed poses and drawing prompts.` },
    { route: 'library', icon: 'library', title: 'Library', text: `${resourceCount} videos and written lessons from Drawabox, Proko and other teachers.` },
    { route: 'sketchbook', icon: 'sketchbook', title: 'Sketchbook', text: pageCount ? `${pageCount} page${pageCount === 1 ? '' : 's'} so far. Compare your first attempts with your latest.` : 'Photos of your pages, so you can compare your first attempts with your latest.' },
  ];

  return (
    <div className="page home">
      <section className="continue" aria-labelledby="continue-title">
        {lesson && exercise ? (
          <>
            <div className="continue-text">
              <h1 id="continue-title">{record ? 'Continue' : 'Next'}: Lesson {lesson.number}, {lesson.title}</h1>
              <p>{record
                ? `You've tried the exercise. Draw another page whenever you like; the lesson is done when every check holds.`
                : `${lesson.summary} The exercise takes about ${exercise.minutes} minutes.`}</p>
              <div className="actions">
                <a className="button primary" href={href('lesson', lesson.slug)}>{record ? 'Back to the lesson' : 'Open the lesson'}</a>
                <a className="button" href={href('do', exercise.id)}>Go to the exercise</a>
              </div>
            </div>
            {lesson.example ? <DiagramView diagram={content.diagrams[lesson.example]} className="continue-art" /> : null}
          </>
        ) : (
          <div className="continue-text">
            <h1 id="continue-title">You've finished every lesson</h1>
            <p>Keep your skills up with the exercises below, or go back to any lesson in the course.</p>
          </div>
        )}
      </section>

      <ul className="place-cards stagger" aria-label="Places">
        {places.map((place) => (
          <li key={place.route}>
            <a className="card place-card" href={href(place.route)}>
              <span className="place-card-icon"><Icon name={place.icon} size={22} /></span>
              <span className="card-title">{place.title}</span>
              <span className="card-text">{place.text}</span>
            </a>
          </li>
        ))}
      </ul>

      <section aria-labelledby="practice-title">
        <div className="section-head">
          <h2 id="practice-title">Practice</h2>
          <a href={href('practice')}>All exercises</a>
        </div>
        <Suggestions items={items} seed={seed} onAnother={() => setOffset((value) => value + 1)} />
      </section>

      {lastPage ? (
        <section aria-labelledby="last-title">
          <div className="section-head">
            <h2 id="last-title">Your last page</h2>
            <a href={href('sketchbook')}>Sketchbook</a>
          </div>
          <a className="card last-page" href={href('sketchbook', lastPage.id!)}>
            <BlobImage blob={lastPage.thumb} alt="" className="last-page-image" />
            <span>
              <span className="card-title">{content.practice[lastPage.practiceId]?.title ?? 'Drawing prompt'}</span>
              <span className="card-meta">{shortDate(lastPage.createdAt)}</span>
            </span>
          </a>
        </section>
      ) : null}
    </div>
  );
}
