import { useEffect, useState } from 'react';
import { useContent } from '../content/load';
import { KIND_LABEL, type Inline, type PracticeItem } from '../content/types';
import { makePrompt } from '../engine/prompts';
import { href } from '../router';
import { useAppData } from '../store/appData';
import { recordExercise } from '../store/db';
import { preparePhoto, type PreparedPhoto } from '../store/photo';
import { DiagramView } from '../ui/Diagram';
import { InlineText, Paragraphs } from '../ui/Inline';
import { chime } from '../ui/sound';
import { clock, useTimer } from '../ui/useTimer';
import { NotFound } from './Lesson';

// A prompt to draw something for its own sake, built for the seed in the address.
function freeItem(prompt: string): PracticeItem {
  return {
    id: 'free', lesson: '', main: false, title: 'Draw for its own sake', kind: 'imagination', minutes: 10,
    text: [[{ t: 'text', v: 'Draw this from imagination. Stop when the time is up, or keep going if you are enjoying it.' }]],
    steps: [], rounds: [{ label: '', seconds: 600 }], reference: { type: 'prompt', prompt }, check: [],
  };
}

export function ExercisePage({ practiceId, seed }: { practiceId?: string; seed?: number }) {
  const content = useContent();
  const item = practiceId ? content.practice[practiceId] : freeItem(makePrompt(content.prompts, seed ?? 0));
  if (!item) return <NotFound />;
  return <Exercise key={`${item.id}:${seed ?? ''}`} item={item} />;
}

function Exercise({ item }: { item: PracticeItem }) {
  const content = useContent();
  const { settings } = useAppData();
  const lesson = item.lesson ? content.lessons[item.lesson] : undefined;
  const checks: Inline[] = item.main && lesson ? lesson.checks : item.check;
  const timer = useTimer(item.rounds, () => { if (settings.sound) chime(); });
  const round = item.rounds[timer.round];
  const total = item.rounds.reduce((sum, r) => sum + r.seconds, 0);
  const back = lesson ? href('lesson', lesson.slug) : href();

  // Space starts and pauses the timer while nothing else has focus.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || (event.target instanceof HTMLElement && event.target.closest('button, input, a, textarea, select'))) return;
      event.preventDefault();
      if (timer.phase === 'ready') timer.start();
      else if (timer.phase === 'running') timer.pause();
      else if (timer.phase === 'paused') timer.resume();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [timer]);

  const prompt = item.reference.type === 'prompt' ? item.reference.prompt : round?.label || '';

  return (
    <div className="exercise">
      <div className={`reference is-${item.reference.type}`}>
        {item.reference.type === 'diagram' ? (
          <DiagramView diagram={content.diagrams[item.reference.diagram]} className="reference-art" />
        ) : (
          <p className="reference-prompt">{prompt || item.title}</p>
        )}
      </div>

      <aside className="panel" aria-label="Exercise">
        <a className="quiet back" href={back}>{lesson ? `Back to lesson ${lesson.number}` : 'Home'}</a>
        <p className="eyebrow">{lesson ? `Lesson ${lesson.number} · ` : ''}{KIND_LABEL[item.kind]}</p>
        <h1>{item.title}</h1>
        <Paragraphs items={item.text} />
        {item.steps.length ? <p className="steps-mini">{item.steps.join(' · ')}</p> : null}

        {timer.phase !== 'finished' ? (
          <div className="timer" aria-live="polite">
            {item.rounds.length > 1 ? (
              <p className="round">{round?.label ? `${round.label} · ` : ''}{timer.round + 1} of {item.rounds.length}</p>
            ) : null}
            <p className="clock">{clock(timer.phase === 'ready' ? round?.seconds ?? 0 : timer.remaining)}</p>
            <p className="meta">{timer.phase === 'ready' ? `${Math.round(total / 60)} min in all · Space starts and pauses` : timer.phase === 'paused' ? 'Paused' : ' '}</p>
            <div className="actions">
              {timer.phase === 'ready' ? <button type="button" className="button primary" onClick={timer.start}>Start</button> : null}
              {timer.phase === 'running' ? <button type="button" className="button" onClick={timer.pause}>Pause</button> : null}
              {timer.phase === 'paused' ? <button type="button" className="button primary" onClick={timer.resume}>Resume</button> : null}
              {timer.phase !== 'ready' && item.rounds.length > 1 ? <button type="button" className="quiet" onClick={timer.skipRound}>Next round</button> : null}
              <button type="button" className="quiet" onClick={timer.finish}>{timer.phase === 'ready' ? 'Skip the timer' : 'Finish now'}</button>
            </div>
          </div>
        ) : (
          <Finish item={item} checks={checks} />
        )}
      </aside>
    </div>
  );
}

function Finish({ item, checks }: { item: PracticeItem; checks: Inline[] }) {
  const content = useContent();
  const lesson = item.lesson ? content.lessons[item.lesson] : undefined;
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [preview, setPreview] = useState('');
  const [held, setHeld] = useState<boolean[]>(() => checks.map(() => false));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<null | { done: boolean }>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const take = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    try {
      const prepared = await preparePhoto(file);
      setPhoto(prepared);
      setPreview(URL.createObjectURL(prepared.thumb));
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'That photo could not be read.');
    }
  };

  const save = async (withPhoto: boolean) => {
    setBusy(true);
    try {
      const allHeld = checks.length > 0 && held.every(Boolean);
      await recordExercise({
        practiceId: item.id, lesson: item.lesson, main: item.main, allChecksHeld: allHeld,
        page: withPhoto && photo ? { ...photo, checksHeld: held.flatMap((value, i) => (value ? [i] : [])), checkCount: checks.length } : undefined,
      });
      setSaved({ done: item.main && allHeld });
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Saving failed.');
    } finally {
      setBusy(false);
    }
  };

  if (saved) {
    return (
      <section className="finish" aria-live="polite">
        <h2>Saved</h2>
        <p>{saved.done ? `Every check held, so lesson ${lesson?.number} is done. It will come back for review in a couple of days.` : photo ? 'Your page is in Drawings.' : 'The exercise is in your practice history.'}</p>
        <div className="actions">
          {lesson ? <a className="button primary" href={href('lesson', lesson.slug)}>Back to the lesson</a> : null}
          <a className="button" href={href()}>Home</a>
          {photo ? <a className="quiet" href={href('drawings')}>Drawings</a> : null}
        </div>
      </section>
    );
  }

  return (
    <section className="finish">
      <h2>Add your page</h2>
      <p>A photo of the page goes into Drawings, where you can put it beside later ones.</p>
      <label
        className={`drop ${preview ? 'has-photo' : ''}`}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); void take(event.dataTransfer.files[0]); }}
      >
        <input type="file" accept="image/*" onChange={(event) => void take(event.target.files?.[0])} />
        {preview ? <img src={preview} alt="Your page" /> : <span>Choose a photo, or drop one here</span>}
      </label>

      {checks.length ? (
        <fieldset className="check-boxes">
          <legend>Tick each check that holds on this page</legend>
          {checks.map((check, i) => (
            <label key={i} className="check-box">
              <input type="checkbox" checked={held[i] ?? false} onChange={(event) => setHeld((list) => list.map((value, j) => (j === i ? event.target.checked : value)))} />
              <span><InlineText nodes={check} /></span>
            </label>
          ))}
          {item.main ? <p className="meta">When every check holds, the lesson is done.</p> : null}
        </fieldset>
      ) : null}

      {error ? <p className="error" role="alert">{error}</p> : null}
      <div className="actions">
        <button type="button" className="button primary" disabled={busy || !photo} onClick={() => void save(true)}>Save</button>
        <button type="button" className="quiet" disabled={busy} onClick={() => void save(false)}>Save without a photo</button>
      </div>
    </section>
  );
}
