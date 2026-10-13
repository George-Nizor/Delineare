import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { go, href, useApp } from '../app/state';
import { formatDate, useBlobUrl } from '../components/bits';
import { db, type CheckAnswer, type Drawing } from '../store/db';
import { creditLine } from '../references/museums';

const ANSWER_TEXT: Record<CheckAnswer, string> = { yes: 'Yes', partly: 'Partly', 'not-yet': 'Not yet', 'cant-tell': "Can't tell" };

// Every photographed page, newest first, or one chapter's pages. Improvement shows here: the
// same chapter's first and latest pages side by side.
export function Drawings({ moduleId }: { moduleId?: string }) {
  const { course } = useApp();
  const drawings = useLiveQuery(
    () => (moduleId ? db.drawings.where('moduleId').equals(moduleId).toArray() : db.drawings.toArray())
      .then((all) => all.filter((drawing) => drawing.photo).sort((a, b) => b.date.localeCompare(a.date))),
    [moduleId], [] as Drawing[],
  );
  const module = moduleId ? course.module.get(moduleId) : null;
  const first = drawings[drawings.length - 1];
  const latest = drawings[0];

  return (
    <article className="page wide stack gap-28" aria-labelledby="drawings-title">
      <header className="stack gap-10">
        <span className="sc">{module ? `Chapter ${course.chapter.get(module.id)}` : 'Your pages'}</span>
        <h1 id="drawings-title" className="disp chapter-title">{module ? module.title : 'Drawings'}</h1>
        <p className="lede">{drawings.length ? `${drawings.length} photographed ${drawings.length === 1 ? 'page' : 'pages'}, kept on this computer.` : 'Each session ends by asking for a photo of the page. They collect here.'}</p>
        {module ? <a href={href({ page: 'drawings' })}>All pages</a> : null}
      </header>

      {module && first && latest && first !== latest ? (
        <section className="stack gap-14" aria-label="First and latest">
          <h2 className="section-title">First and latest</h2>
          <div className="compare">
            <Framed drawing={first} label={`First, ${formatDate(first.date, false)}`} />
            <Framed drawing={latest} label={`Latest, ${formatDate(latest.date, false)}`} />
          </div>
        </section>
      ) : null}

      <div className="gallery">
        {drawings.map((drawing) => <Tile key={drawing.id} drawing={drawing} />)}
      </div>
    </article>
  );
}

function Tile({ drawing }: { drawing: Drawing }) {
  const { course } = useApp();
  const url = useBlobUrl(drawing.thumb);
  const module = drawing.moduleId ? course.module.get(drawing.moduleId) : null;
  return (
    <figure>
      <a href={href({ page: 'drawing', id: drawing.id! })}>
        {url ? <img src={url} alt={`Page from ${formatDate(drawing.date)}${module ? `, ${module.title}` : ''}`} loading="lazy" /> : <span className="thumb" />}
      </a>
      <figcaption className="stack">
        <span className="mono muted" style={{ fontSize: 12 }}>{formatDate(drawing.date, false)}</span>
        <span className="read" style={{ fontSize: 16 }}>{module?.title || 'Free drawing'}</span>
      </figcaption>
    </figure>
  );
}

function Framed({ drawing, label }: { drawing: Drawing; label: string }) {
  const url = useBlobUrl(drawing.photo);
  return (
    <figure>
      <div className="frame">{url ? <img src={url} alt={label} /> : null}</div>
      <figcaption className="caption">{label}</figcaption>
    </figure>
  );
}

export function DrawingPage({ id }: { id: number }) {
  const { course } = useApp();
  const drawing = useLiveQuery(() => db.drawings.get(id), [id]);
  const previous = useLiveQuery(async () => {
    if (!drawing?.moduleId) return undefined;
    const same = await db.drawings.where('moduleId').equals(drawing.moduleId).toArray();
    return same.filter((other) => other.photo && other.date < drawing.date).sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [drawing?.id]);
  const url = useBlobUrl(drawing?.photo);
  const [overlay, setOverlay] = useState(50);
  if (drawing === undefined) return <article className="page"><p className="read">Opening</p></article>;
  if (!drawing) return <article className="page"><h1 className="section-title">That page is not here</h1><a href={href({ page: 'drawings' })}>All pages</a></article>;
  const module = drawing.moduleId ? course.module.get(drawing.moduleId) : null;

  const remove = async () => {
    if (!window.confirm('Delete this page and its photo? This cannot be undone.')) return;
    await db.drawings.delete(id);
    go({ page: 'drawings' });
  };

  return (
    <article className="page wide stack gap-28" aria-labelledby="drawing-title">
      <header className="between">
        <div className="stack gap-6">
          <span className="sc">{formatDate(drawing.date)}</span>
          <h1 id="drawing-title" className="disp chapter-title" style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>{module ? module.title : 'Free drawing'}</h1>
        </div>
        <div className="inline">
          {module ? <a href={href({ page: 'module', id: module.id })}>Open the chapter</a> : null}
          <button type="button" className="ghost" onClick={() => void remove()}>Delete</button>
        </div>
      </header>

      <div className="row">
        <figure className="stack gap-10" style={{ margin: 0 }}>
          {drawing.reference && url ? (
            <>
              <div className="overlay-stack">
                <img src={drawing.reference.image} alt={`Reference: ${drawing.reference.title}`} referrerPolicy="no-referrer" />
                <img src={url} alt="Your page" style={{ opacity: overlay / 100 }} />
              </div>
              <label className="inline" style={{ fontSize: 14 }}>Your page over the reference
                <input type="range" min={0} max={100} value={overlay} onChange={(event) => setOverlay(Number(event.target.value))} />
              </label>
              <figcaption className="caption">{creditLine(drawing.reference)}</figcaption>
            </>
          ) : url ? <div className="plate"><img src={url} alt="Your page" /></div> : <p className="caption">No photo was taken for this one.</p>}
        </figure>
        <aside className="margin">
          {drawing.note ? drawing.note.split('\n').map((line) => <p key={line} className="note">{line}</p>) : <p className="note">No note.</p>}
        </aside>
      </div>

      {module ? (
        <section className="row">
          <div className="stack gap-10">
            <h2 className="section-title">{drawing.revisit ? 'The revisit checks' : 'The checks'}</h2>
            <ul className="read" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 17 }}>
              {module.done_when.map((check, index) => (
                drawing.checks[index] ? <li key={check.text} className="between"><span>{check.text}</span><span className="tag">{ANSWER_TEXT[drawing.checks[index]!]}</span></li> : null
              ))}
            </ul>
          </div>
          <div />
        </section>
      ) : null}

      {previous ? (
        <section className="stack gap-14">
          <h2 className="section-title">Beside the one before</h2>
          <div className="compare">
            <Framed drawing={previous} label={`Before, ${formatDate(previous.date, false)}`} />
            <Framed drawing={drawing} label={`This one, ${formatDate(drawing.date, false)}`} />
          </div>
        </section>
      ) : null}
    </article>
  );
}
