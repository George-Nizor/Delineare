import { useState } from 'react';
import { useContent, writtenLessons } from '../content/load';
import { KIND_LABEL } from '../content/types';
import { href } from '../router';
import { lessonStatus, useAppData } from '../store/appData';
import { setKnown } from '../store/db';
import { DiagramView } from '../ui/Diagram';
import { InlineText, Paragraphs } from '../ui/Inline';
import { ResourceLine } from '../ui/Resource';

export function LessonPage({ slug }: { slug: string }) {
  const content = useContent();
  const { records, settings } = useAppData();
  const [folded, setFolded] = useState<boolean | null>(null);
  const lesson = content.lessons[slug];
  if (!lesson) return <NotFound />;

  const record = records.get(slug);
  const status = lessonStatus(record);
  const part = content.parts[lesson.part - 1]!;
  const exercise = content.practice[lesson.exercise]!;
  const later = lesson.practice.filter((id) => id !== lesson.exercise).map((id) => content.practice[id]!);
  const stepsFolded = folded ?? (settings.foldSteps || status === 'known');
  const written = writtenLessons(content);
  const index = written.findIndex((entry) => entry.slug === slug);
  const previous = written[index - 1];
  const next = written[index + 1];

  return (
    <article className="page lesson">
      <header className="lesson-head">
        <p className="eyebrow">Lesson {lesson.number} · Part {part.number}, {part.title}</p>
        <h1>{lesson.title}</h1>
        <p className="outcome">After this you can {lesson.outcome}</p>
        {lesson.needs.length ? (
          <p className="needs">
            Needs{' '}
            {lesson.needs.map((need, i) => {
              const entry = content.parts.flatMap((p) => p.lessons).find((l) => l.slug === need)!;
              return <span key={need}>{i ? ', ' : ''}<a href={href('lesson', need)}>lesson {entry.number}, {entry.title}</a></span>;
            })}
            .
          </p>
        ) : null}
        <p className="status-line">
          {status === 'known' ? (
            <>You marked this lesson as known. <button type="button" className="quiet" onClick={() => setKnown(slug, false)}>Undo</button></>
          ) : status === 'done' ? (
            'Done: the checks held.'
          ) : (
            <button type="button" className="quiet" onClick={() => setKnown(slug, true)}>I already know this</button>
          )}
        </p>
      </header>

      <DiagramView diagram={lesson.example ? content.diagrams[lesson.example] : undefined} className="lesson-example" />

      {lesson.terms.length ? (
        <section className="terms" aria-labelledby="terms-title">
          <h2 id="terms-title">Words to know</h2>
          <dl>
            {lesson.terms.map((term) => (
              <div key={term.term} className="term">
                <dt>{term.term}</dt>
                <dd><InlineText nodes={term.text} /></dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <section className="how" aria-labelledby="how-title">
        <div className="section-head">
          <h2 id="how-title">How</h2>
          <button type="button" className="quiet" aria-expanded={!stepsFolded} onClick={() => setFolded(!stepsFolded)}>
            {stepsFolded ? 'Show the steps' : 'Fold the steps away'}
          </button>
        </div>
        {stepsFolded ? (
          <p className="folded">{lesson.steps.map((step) => step.title).join(' · ')}</p>
        ) : (
          <>
            <ol className="steps">
              {lesson.steps.map((step, i) => (
                <li key={step.title} className="step">
                  <div className="step-text">
                    <span className="step-number" aria-hidden="true">{i + 1}</span>
                    <h3>{step.title}</h3>
                    <p><InlineText nodes={step.text} /></p>
                  </div>
                  <DiagramView diagram={step.diagram ? content.diagrams[step.diagram] : undefined} className="step-diagram" />
                </li>
              ))}
            </ol>
            <Paragraphs items={lesson.howNotes} className="note" />
          </>
        )}
      </section>

      <section className="mistake" aria-labelledby="mistake-title">
        <h2 id="mistake-title">The usual mistake</h2>
        <DiagramView diagram={lesson.mistake.diagram ? content.diagrams[lesson.mistake.diagram] : undefined} className="mistake-diagram" />
        <Paragraphs items={lesson.mistake.text} />
      </section>

      <section className="do-this" aria-labelledby="do-title">
        <h2 id="do-title">Do this <span className="meta">· {exercise.minutes} minutes</span></h2>
        <Paragraphs items={exercise.text} />
        <a className="button primary" href={href('do', exercise.id)}>Start the exercise</a>
      </section>

      <section className="check" aria-labelledby="check-title">
        <h2 id="check-title">Check</h2>
        <Paragraphs items={lesson.checkIntro} />
        <ol className="checks">
          {lesson.checks.map((check, i) => <li key={i}><InlineText nodes={check} /></li>)}
        </ol>
        <Paragraphs items={lesson.checkNotes} className="note" />
      </section>

      <section className="watch" aria-labelledby="watch-title">
        <h2 id="watch-title">Watch</h2>
        <ul className="resources">
          {lesson.watch.map((id) => content.resources[id]).filter(Boolean).map((resource) => <ResourceLine key={resource!.id} resource={resource!} />)}
        </ul>
      </section>

      {later.length ? (
        <section className="later" aria-labelledby="later-title">
          <h2 id="later-title">Practise later</h2>
          <ul className="practice-list">
            {later.map((item) => (
              <li key={item.id}>
                <a href={href('do', item.id)}>
                  <span className="practice-title">{item.title}</span>
                  <span className="meta">{item.minutes} min · {KIND_LABEL[item.kind]}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="lesson-nav" aria-label="Other lessons">
        {previous ? <a href={href('lesson', previous.slug)}>Lesson {previous.number}, {previous.title}</a> : <span />}
        {next ? <a href={href('lesson', next.slug)}>Lesson {next.number}, {next.title}</a> : <a href={href('course')}>The course</a>}
      </nav>
    </article>
  );
}

export function NotFound() {
  return (
    <div className="page">
      <h1>Nothing here</h1>
      <p><a href={href()}>Go home</a></p>
    </div>
  );
}
