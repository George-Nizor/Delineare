import { useLiveQuery } from 'dexie-react-hooks';
import { href, useApp } from '../app/state';
import { hoursText, ROMAN } from '../data/load';
import { Footnote, moduleResources, StatusMark, STATUS_TEXT, useBlobUrl, formatDate } from '../components/bits';
import { revisitOf, statusOf } from '../engine/plan';
import { db, type Drawing } from '../store/db';

const KIND_TEXT = { judgement: 'you judge', measured: 'measured', process: 'counted from your log' } as const;

// A module as a chapter of the book: the idea (our own lesson where free material leaves a gap),
// the plate, the exercises, the checks, and the sources as footnotes. Common mistakes sit in the
// margin beside the text they belong to.
export function ModulePage({ id }: { id: string }) {
  const { course, progress, settings, update } = useApp();
  const module = course.module.get(id);
  const drawings = useLiveQuery(() => db.drawings.where('moduleId').equals(id).reverse().sortBy('date'), [id], [] as Drawing[]);
  if (!module) {
    return <article className="page"><h1 className="section-title">No such chapter</h1><p><a href={href({ page: 'contents' })}>Back to the contents</a></p></article>;
  }
  const status = statusOf(module, progress);
  const row = progress.get(module.id);
  const phase = course.data.phases.find((entry) => entry.number === module.phase);
  const resources = moduleResources(course, module);
  const latest = drawings[0];
  const sections = module.lesson?.sections || [];
  const mistakes = module.common_mistakes;
  const half = Math.ceil(mistakes.length / 2);

  return (
    <article className="page stack gap-40" aria-labelledby="module-title">
      <header className="row">
        <div className="stack gap-14">
          <span className="sc">Chapter {course.chapter.get(module.id)} · Part {ROMAN[module.phase]}, {phase?.title}</span>
          <h1 id="module-title" className="disp chapter-title">{module.title}</h1>
          <p className="lede">{module.summary}</p>
          <div className="inline">
            <span className="inline" style={{ gap: 8 }}><StatusMark status={status} /><span className="muted">{STATUS_TEXT[status]}{row?.firstPass && !row.passed ? `, on ${formatDate(row.firstPass, false)}. It counts as done when the checks hold again on another day.` : ''}</span></span>
          </div>
          <div className="inline">
            {status !== 'locked' && status !== 'passed' ? (
              settings.focusModule === module.id
                ? <button type="button" className="ghost" onClick={() => update('focusModule', null)}>Today's module. Let the plan choose instead</button>
                : <button type="button" className="ghost" onClick={() => update('focusModule', module.id)}>Make this today's module</button>
            ) : null}
            {module.practice[0] && status !== 'locked' ? <a className="btn small" href={href({ page: 'session', mode: 'practice', moduleId: module.id })}>Practise now</a> : null}
          </div>
        </div>
        <dl className="facts">
          <dt>TIER</dt><dd>{module.tier[0]!.toUpperCase() + module.tier.slice(1)}{module.spine ? ', spine' : ''}</dd>
          <dt>TIME</dt><dd>{hoursText(module.est_hours)}, estimated</dd>
          {module.ongoing_hours ? <><dt>THEN</dt><dd>{hoursText(module.ongoing_hours)} ongoing</dd></> : null}
          <dt>FREE</dt><dd>{module.free_coverage === 'strong' ? 'Well covered' : module.free_coverage === 'partial' ? 'Partly covered' : 'Thin coverage'}</dd>
          <dt>NEEDS</dt>
          <dd>{module.prerequisites.length ? module.prerequisites.map((prerequisite, index) => (
            <span key={prerequisite}>{index ? ', ' : ''}<a href={href({ page: 'module', id: prerequisite })}>{course.module.get(prerequisite)?.title}</a>{progress.get(prerequisite)?.firstPass ? ' (done)' : ''}</span>
          )) : 'Nothing'}</dd>
        </dl>
      </header>

      <div className="row">
        <div className="body-text">
          {sections.length ? sections.map((section, index) => (
            <section key={section.heading} className="stack gap-10" style={{ marginTop: index ? 26 : 0 }}>
              <h2 className="section-title" style={{ fontSize: 24 }}>{section.heading}</h2>
              {section.body.split(/\n\n+/).map((paragraph, at) => <p key={at} className={index === 0 && at === 0 ? 'dropcap' : undefined}>{paragraph}</p>)}
            </section>
          )) : (
            <p className="dropcap">The teaching for this chapter comes from the sources listed at the end. Start with the first one, watch or read it once, then close it and draw the first exercise from what you remember. Come back to it after you have drawn, not before.</p>
          )}
          {sections.length ? <p className="caption" style={{ marginTop: 18 }}>Written for Delineare, because the free material does not cover all of this.</p> : null}
        </div>
        <aside className="margin" aria-label="Common mistakes">
          {mistakes.slice(0, half).map((mistake) => <p key={mistake} className="note">{mistake}</p>)}
        </aside>
      </div>

      <section className="row">
        <div className="stack gap-14">
          <h2 className="section-title">By the end you can</h2>
          <ul className="read" style={{ margin: 0, paddingLeft: 22, fontSize: 18, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {module.learning_outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
          </ul>
        </div>
        <aside className="margin" aria-label="More common mistakes">
          {mistakes.slice(half).map((mistake) => <p key={mistake} className="note">{mistake}</p>)}
        </aside>
      </section>

      <section className="row">
        <div className="stack gap-14">
          <h2 className="section-title">Exercises</h2>
          <ol className="exercises">
            {module.practice.map((practice, index) => (
              <li key={practice.id}>
                <span className="numeral" aria-hidden="true">{index + 1}</span>
                <span className="read" style={{ fontSize: 18, lineHeight: 1.45 }}>
                  <b>{practice.title}.</b> {practice.description}{' '}
                  <span className="mono muted" style={{ fontSize: 12 }}>{practice.dose}.</span>
                </span>
                {status === 'locked' ? <span className="tag">Not open yet</span>
                  : <a className={index === 0 ? 'btn small' : 'ghost'} href={href({ page: 'session', mode: 'practice', moduleId: module.id, practiceId: practice.id })}>Begin</a>}
              </li>
            ))}
          </ol>
        </div>
        <aside className="margin">
          <p className="note"><b>Revisit</b>{revisitOf(module).title}. {revisitOf(module).description} {revisitOf(module).minutes} minutes, lesson closed.</p>
        </aside>
      </section>

      <section className="row">
        <div className="stack gap-14">
          <h2 className="section-title">You have it when</h2>
          <ul className="read" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 18, lineHeight: 1.45 }}>
            {module.done_when.map((check, index) => {
              const answer = latest?.checks[index];
              return (
                <li key={check.text} style={{ display: 'grid', gridTemplateColumns: '22px minmax(0, 1fr)', gap: 12 }}>
                  <span aria-hidden="true" className={`mark ${answer === 'yes' ? 'passed' : answer ? 'active' : 'available'}`} />
                  <span>{check.text} <span className="tag">{KIND_TEXT[check.kind]}</span>
                    <span className="visually-hidden">{answer ? `Last answer: ${answer}` : 'Not checked yet'}</span></span>
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="margin">
          <p className="note">{latest ? `Marks show your answers from ${formatDate(latest.date, false)}.` : 'Answer these after each session, against a photo of your page.'} A chapter is done when every check holds on two different days.</p>
        </aside>
      </section>

      {drawings.length ? (
        <section className="stack gap-14">
          <div className="between"><h2 className="section-title">Your pages for this chapter</h2><a href={href({ page: 'drawings', moduleId: module.id })}>All {drawings.length}</a></div>
          <div className="gallery">{drawings.slice(0, 4).map((drawing) => <PageThumb key={drawing.id} drawing={drawing} />)}</div>
        </section>
      ) : null}

      <footer className="row">
        <div className="stack gap-10 rule-strong">
          <span className="sc">Further study</span>
          {resources.length ? (
            <ol className="footnotes">{resources.map(({ entry, resource }) => <Footnote key={entry.rid} entry={entry} resource={resource} />)}</ol>
          ) : <p className="caption">No outside material for this chapter yet.</p>}
          {module.school_reference?.length ? (
            <p className="caption">How schools teach it: {module.school_reference.map((school, index) => (
              <span key={school.url}>{index ? '; ' : ''}<a href={school.url} target="_blank" rel="noopener noreferrer">{school.institution}</a></span>
            ))}.</p>
          ) : null}
        </div>
        <div />
      </footer>
    </article>
  );
}

function PageThumb({ drawing }: { drawing: Drawing }) {
  const url = useBlobUrl(drawing.thumb);
  return (
    <figure>
      <a href={href({ page: 'drawing', id: drawing.id! })}>{url ? <img src={url} alt={`Page from ${formatDate(drawing.date)}`} /> : <span className="thumb" />}</a>
      <figcaption className="mono muted" style={{ fontSize: 12 }}>{formatDate(drawing.date, false)}</figcaption>
    </figure>
  );
}
