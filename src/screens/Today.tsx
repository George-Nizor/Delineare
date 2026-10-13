import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { go, href, useApp } from '../app/state';
import { formatDate, minutesText, roman, useBlobUrl, useNow } from '../components/bits';
import { planFor, slotFor, today, type Plan, type Step } from '../engine/plan';
import { db } from '../store/db';
import { creditLine } from '../references/museums';
import { useReferences } from '../references/useReferences';

const KIND_WORD: Record<Step['kind'], string> = {
  'warm-up': 'Warm up.',
  revisit: 'Revisit.',
  exercise: 'Exercise.',
  play: 'Invent.',
  log: 'Check.',
};

// Today is a book opened at the day's plate: the reference on the left, the session on the right.
export function Today() {
  const app = useApp();
  const { course, progress, logged, settings } = app;
  const now = useNow();
  const day = today(now);
  const slot = slotFor(course, settings.template, day);
  const plan = planFor(slot, { course, progress, logged, day, templateId: settings.template, chosenModule: settings.focusModule });
  const main = plan.steps.find((step) => step.kind === 'exercise' || step.kind === 'play') || plan.steps[0] || null;
  const chapter = plan.module ? course.chapter.get(plan.module.id) || 0 : 0;
  const last = useLiveQuery(() => db.drawings.orderBy('date').last(), []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.key !== 'Enter' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (target && target !== document.body && target.closest('a, button, input, select, textarea, [role="button"]')) return;
      go({ page: 'session', mode: 'today' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="spread">
      <Plate step={main} chapter={chapter} />
      <div className="gutter" aria-hidden="true" />
      <section className="page" aria-labelledby="today-title">
        <span className="sc">{formatDate(day)}</span>
        {slot ? null : <p className="caption">Your plan has no session on {formatDate(day).split(' ')[0]}. Draw anyway if you like.</p>}
        <h1 id="today-title" className="disp chapter-title" style={{ fontSize: 'clamp(36px, 4vw, 54px)' }}>{plan.title}</h1>
        <p className="read" style={{ fontSize: 20, lineHeight: 1.5, maxWidth: '46ch' }}>
          {minutesText(plan.minutes)} in {plan.steps.length} parts{plan.module ? <>, from <a href={href({ page: 'module', id: plan.module.id })}>{plan.module.title}</a></> : null}. Draw on paper and keep this page beside you; it holds the reference and the time.
        </p>
        <SessionSteps plan={plan} />
        <div className="inline" style={{ gap: 22 }}>
          <a className="btn" href={href({ page: 'session', mode: 'today' })}>Start session <span className="kbd">Enter</span></a>
          <a href={href({ page: 'session', mode: 'short' })}>A 10-minute version</a>
          <a href={href({ page: 'contents' })}>Study something else</a>
        </div>
        <LastPage drawingId={last?.id ?? null} />
        <span className="folio" style={{ alignSelf: 'flex-end' }}>{chapter ? chapter + 1 : ''}</span>
      </section>
    </div>
  );
}

function SessionSteps({ plan }: { plan: Plan }) {
  return (
    <ol className="steps" aria-label="The session">
      {plan.steps.map((step, index) => (
        <li key={`${step.kind}-${index}`}>
          <span className="numeral" aria-hidden="true">{roman(index + 1)}.</span>
          <span className="read" style={{ fontSize: 17, lineHeight: 1.45 }}>
            <b>{KIND_WORD[step.kind]}</b> {step.title}.{' '}
            <span className="muted">{shorten(step.description)}</span>
          </span>
          <span className="mono">{minutesText(step.minutes)}</span>
        </li>
      ))}
    </ol>
  );
}

function shorten(text: string, limit = 150): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return `${cut.slice(0, cut.lastIndexOf(' '))}...`;
}

function Plate({ step, chapter }: { step: Step | null; chapter: number }) {
  const references = useReferences(step?.reference || null);
  const first = references.items[0];
  const kind = step?.reference.kind || 'none';
  const words: Partial<Record<string, string>> = {
    life: 'Draw from life. Set the real objects up under one lamp before you start.',
    memory: 'From memory. The lesson stays closed until the time is up.',
    prompt: 'A prompt appears when you start. Draw it without reference.',
    'pose-site': 'Timed poses. The session opens the pose site in your browser and keeps the time here.',
    none: 'No reference. Just the page and the clock.',
    tool: step?.reference.tool === 'light' ? 'The light tool opens when you start. Set the lamp, then draw what it shows.'
      : step?.reference.tool === 'form' ? 'The form tool opens when you start. Turn the form, draw it, then check the vanishing lines.'
        : 'No reference image for this one. Paper, a ruler and the clock.',
  };
  return (
    <section className="page plate-page" aria-label="Today's plate">
      <div className="between">
        <span className="sc">Plate</span>
        <span className="plate-number" aria-label={`Plate ${chapter}`}>{chapter || ''}</span>
      </div>
      <figure className="stack gap-14" style={{ margin: 0, flex: 1 }}>
        {first ? (
          <div className="plate" style={{ flex: 1, minHeight: 320 }}>
            <img src={first.image} alt={`Reference: ${first.title}`} referrerPolicy="no-referrer" />
          </div>
        ) : (
          <div className="plate text" style={{ flex: 1 }}>
            <p>{references.loading ? 'Finding a reference' : words[kind] || words.none}</p>
          </div>
        )}
        <figcaption className="caption">
          {first ? creditLine(first) : step ? step.description : ''}
          {references.offline ? ' The museum collections could not be reached, so this is one of the built-in renders.' : ''}
        </figcaption>
      </figure>
      <span className="folio">{chapter || ''}</span>
    </section>
  );
}

function LastPage({ drawingId }: { drawingId: number | null }) {
  const drawing = useLiveQuery(() => (drawingId ? db.drawings.get(drawingId) : undefined), [drawingId]);
  const { course } = useApp();
  const thumb = useBlobUrl(drawing?.thumb);
  if (!drawing) {
    return (
      <aside className="rule-top caption" aria-label="Your pages" style={{ marginTop: 'auto' }}>
        Your photographed pages will appear here. Each session ends by asking for one.
      </aside>
    );
  }
  const module = drawing.moduleId ? course.module.get(drawing.moduleId) : null;
  const yes = Object.values(drawing.checks).filter((answer) => answer === 'yes').length;
  return (
    <aside className="rule-top" aria-label="Your last page" style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '150px minmax(0, 1fr)', gap: 18 }}>
      <a href={href({ page: 'drawing', id: drawing.id! })}>{thumb ? <img className="thumb" src={thumb} alt="Your last page" /> : <span className="thumb" />}</a>
      <div className="stack gap-6">
        <span className="sc">Your last page, {formatDate(drawing.date)}</span>
        <p className="read italic" style={{ fontSize: 16, lineHeight: 1.45 }}>
          {drawing.note ? `"${drawing.note}"` : 'No note.'}{module ? ` ${yes} of ${module.done_when.length} checks met for ${module.title}.` : ''}
        </p>
      </div>
    </aside>
  );
}
