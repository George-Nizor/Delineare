import { useEffect, useState } from 'react';
import { TOTAL_LESSONS, useContent } from '../content/load';
import { KIND_LABEL, type Resource } from '../content/types';
import { href } from '../router';
import { lessonStatus, useAppData } from '../store/appData';
import { setKnown } from '../store/db';
import { DiagramView } from '../ui/Diagram';
import { Icon } from '../ui/Icons';
import { InlineText, Paragraphs } from '../ui/Inline';
import { ResourceLine, VideoEmbed } from '../ui/Resource';
import { Reveal } from '../ui/Reveal';

// "A page of ghosted lines" reads as "Exercise: a page of ghosted lines".
const asExercise = (title: string) => (/^(A|An|The) /.test(title) ? title.charAt(0).toLowerCase() + title.slice(1) : title);

export function LessonPage({ slug }: { slug: string }) {
  const content = useContent();
  const { records, settings } = useAppData();
  const [folded, setFolded] = useState<boolean | null>(null);
  const lesson = content.lessons[slug];
  const sections = lesson ? [
    ['video', 'Video'],
    ['steps', 'Steps'],
    ...(lesson.mistake ? [['mistake', 'Common mistake']] : []),
    ['exercise', 'Exercise'],
    ['check', 'Checking your page'],
    ['more', `More on ${lesson.title.toLowerCase()}`],
  ] : [];
  const visible = useSpy(sections.map(([id]) => id!));
  if (!lesson) return <NotFound />;

  const status = lessonStatus(records.get(slug));
  const part = content.parts[lesson.part - 1]!;
  const exercise = content.practice[lesson.exercise]!;
  const later = lesson.practice.filter((id) => id !== lesson.exercise).map((id) => content.practice[id]!);
  const stepsFolded = folded ?? (settings.foldSteps || status === 'known');
  const all = content.parts.flatMap((p) => p.lessons);
  const index = all.findIndex((entry) => entry.slug === slug);
  const previous = all.slice(0, index).reverse().find((entry) => entry.written);
  const next = all.slice(index + 1).find((entry) => entry.written);
  const resources = lesson.watch.map((id) => content.resources[id]).filter((r): r is Resource => Boolean(r));
  const video = resources.find((r) => r.youtube) ?? resources[0];
  const more = resources.filter((r) => r !== video);

  return (
    <div className="lesson-layout">
      <article className="lesson">
        <header className="lesson-head">
          <h1>Lesson {lesson.number}: {lesson.title}</h1>
          <Paragraphs items={lesson.intro} className="intro" />
          {lesson.needs.length ? (
            <p className="needs">
              It helps to have done{' '}
              {lesson.needs.map((need, i) => {
                const entry = all.find((l) => l.slug === need)!;
                return <span key={need}>{i ? (i === lesson.needs.length - 1 ? ' and ' : ', ') : ''}<a href={href('lesson', need)}>lesson {entry.number}, {entry.title}</a></span>;
              })}{' '}first.
            </p>
          ) : null}
        </header>

        <DiagramView diagram={lesson.example ? content.diagrams[lesson.example] : undefined} className="lesson-example" />

        {video ? (
          <section id="video" className="lesson-section" aria-labelledby="video-title">
            <h2 id="video-title">Video</h2>
            <VideoCard resource={video} />
          </section>
        ) : null}

        <Reveal as="section" className="lesson-section steps-section">
          <div className="section-head" id="steps">
            <h2>Steps</h2>
            <button type="button" className="quiet" aria-expanded={!stepsFolded} onClick={() => setFolded(!stepsFolded)}>
              {stepsFolded ? 'Show the steps' : 'Hide the steps'}
            </button>
          </div>
          {stepsFolded ? (
            <p className="folded">{lesson.steps.map((step) => step.title).join(' · ')}</p>
          ) : (
            <>
              <ol className="steps">
                {lesson.steps.map((step, i) => (
                  <li key={step.title} className={`step ${step.diagram ? 'has-diagram' : ''}`}>
                    <div className="step-text">
                      <span className="step-number" aria-hidden="true">{i + 1}</span>
                      <div>
                        <h3>{step.title}</h3>
                        <p><InlineText nodes={step.text} /></p>
                      </div>
                    </div>
                    <DiagramView diagram={step.diagram ? content.diagrams[step.diagram] : undefined} className="step-diagram" />
                  </li>
                ))}
              </ol>
              <Paragraphs items={lesson.howNotes} className="note" />
            </>
          )}
        </Reveal>

        {lesson.mistake ? (
          <Reveal as="section" className="lesson-section mistake">
            <h2 id="mistake">Common mistake</h2>
            <DiagramView diagram={lesson.mistake.diagram ? content.diagrams[lesson.mistake.diagram] : undefined} className="mistake-diagram" />
            <Paragraphs items={lesson.mistake.text} />
          </Reveal>
        ) : null}

        <Reveal as="section" className="lesson-section">
          <div className="exercise-card" id="exercise">
            <h2>Exercise: {asExercise(exercise.title)}</h2>
            <p className="meta">{exercise.minutes} minutes.</p>
            <Paragraphs items={exercise.text} />
            {exercise.steps.length ? (
              <ol className="step-chips">{exercise.steps.map((step, i) => <li key={step}><b>{i + 1}</b>{step}</li>)}</ol>
            ) : null}
            <div className="actions">
              <a className="button primary" href={href('do', exercise.id)}>Start the exercise</a>
              <span className="meta">The exercise screen shows the steps and a timer while you draw.</span>
            </div>
          </div>
        </Reveal>

        <Reveal as="section" className="lesson-section">
          <h2 id="check">Checking your page</h2>
          <Paragraphs items={lesson.checkIntro} />
          <ol className="checks">
            {lesson.checks.map((check, i) => <li key={i}><InlineText nodes={check} /></li>)}
          </ol>
          <Paragraphs items={lesson.checkNotes} className="note" />
        </Reveal>

        <Reveal as="section" className="lesson-section">
          <h2 id="more">More on {lesson.title.toLowerCase()}</h2>
          {more.length ? <ul className="resources">{more.map((resource) => <ResourceLine key={resource.id} resource={resource} />)}</ul> : null}
          {later.length ? (
            <>
              <h3 className="sub-head">Practice exercises for this lesson</h3>
              <ul className="rows">
                {later.map((item) => (
                  <li key={item.id}>
                    <a className="row" href={href('do', item.id)}>
                      <span className="row-title">{item.title}</span>
                      <span className="meta">{KIND_LABEL[item.kind]} · {item.minutes} min</span>
                      <Icon name="next" size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <p className="meta">Every video and written lesson the course uses is in the <a href={href('library')}>library</a>.</p>
        </Reveal>

        <nav className="lesson-nav" aria-label="Other lessons">
          {previous ? <a className="card" href={href('lesson', previous.slug)}><Icon name="back" size={18} /><span><span className="meta">Previous</span>Lesson {previous.number}: {previous.title}</span></a> : <span />}
          {next ? <a className="card next" href={href('lesson', next.slug)}><span><span className="meta">Next</span>Lesson {next.number}: {next.title}</span><Icon name="next" size={18} /></a> : <a className="card next" href={href('course')}><span><span className="meta">Back to</span>The course</span><Icon name="next" size={18} /></a>}
        </nav>
      </article>

      <aside className="lesson-aside">
        <nav className="toc" aria-label="On this page">
          <h2>On this page</h2>
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={visible === id ? 'on' : ''} onClick={(event) => { event.preventDefault(); document.getElementById(id!)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{label}</a>
          ))}
        </nav>
        <div className="aside-box">
          <span className="aside-box-title">Lesson {lesson.number} of {TOTAL_LESSONS(content)}</span>
          <span className="meta">Part {part.number}: {part.title}</span>
          {status === 'known' ? (
            <p>You marked this lesson as known. <button type="button" className="quiet" onClick={() => setKnown(slug, false)}>Undo</button></p>
          ) : status === 'done' ? (
            <p className="done-line"><Icon name="check" size={16} />Done: every check held.</p>
          ) : (
            <button type="button" className="quiet" onClick={() => setKnown(slug, true)}>I already know this</button>
          )}
        </div>
      </aside>
    </div>
  );
}

// The main video, as a large card that loads YouTube's player only when asked.
function VideoCard({ resource }: { resource: Resource }) {
  const [playing, setPlaying] = useState(false);
  const details = [resource.teacher, resource.minutes ? `${resource.minutes} min` : '', resource.cost === 'paid' ? 'paid' : ''].filter(Boolean).join(' · ');
  if (!resource.youtube) {
    return (
      <a className="card video-link" href={resource.url} target="_blank" rel="noreferrer">
        <span className="card-title">{resource.title}</span>
        <span className="card-meta">{details} · opens on the teacher's site</span>
        <Icon name="open" size={18} />
      </a>
    );
  }
  return (
    <div className="video-card">
      {playing ? (
        <VideoEmbed id={resource.youtube} title={`${resource.title}, ${resource.teacher}`} />
      ) : (
        <button type="button" className="video-poster" onClick={() => setPlaying(true)}>
          <span className="play"><Icon name="play" size={30} /></span>
          <span className="video-poster-title">{resource.title}</span>
          <span className="video-poster-meta">{details}</span>
        </button>
      )}
      <p className="meta">{resource.teacher}{/written/.test(resource.kind) ? <> also has a <a href={resource.url} target="_blank" rel="noreferrer">written version</a> of this lesson.</> : <>. <a href={resource.url} target="_blank" rel="noreferrer">Open it on YouTube</a> instead.</>}</p>
    </div>
  );
}

// Which section is in view, for the "On this page" list.
function useSpy(ids: string[]): string {
  const [visible, setVisible] = useState(ids[0] ?? '');
  const key = ids.join(',');
  useEffect(() => {
    const elements = key.split(',').map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!elements.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const top = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (top) setVisible(top.target.id);
    }, { rootMargin: '-10% 0px -70% 0px' });
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);
  return visible;
}

export function NotFound() {
  return (
    <div className="page narrow">
      <h1>Nothing here</h1>
      <p><a href={href()}>Go to the home page</a></p>
    </div>
  );
}
