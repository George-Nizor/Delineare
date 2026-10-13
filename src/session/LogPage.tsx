import { useState } from 'react';
import type { Module } from '../data/types';
import { useApp } from '../app/state';
import { applyAttempt, today, type Plan, type Step } from '../engine/plan';
import { db, type CheckAnswer, type ReferenceRecord } from '../store/db';
import { preparePhoto, type PreparedPhoto } from '../store/photo';
import { useBlobUrl } from '../components/bits';
import { Answers } from '../components/Answers';

const KIND_TEXT = { judgement: 'you judge', measured: 'measure it against the reference', process: 'count it from your log' } as const;

// The last part of a session: photograph the page, say where it is most off before looking hard,
// answer each check in words, and write one line for next time. No score and no grade.
export function LogPage({ plan, step, module, reference, onSaved, onSkip }: {
  plan: Plan; step: Step; module: Module | null; reference: ReferenceRecord | null; onSaved: (id: number) => void; onSkip: () => void;
}) {
  const { progress } = useApp();
  const [photo, setPhoto] = useState<PreparedPhoto | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [guess, setGuess] = useState('');
  const [note, setNote] = useState('');
  const [checks, setChecks] = useState<Record<number, CheckAnswer>>({});
  const preview = useBlobUrl(photo?.photo);
  const exercise = plan.steps.find((item) => item.kind === 'exercise' || item.kind === 'play');

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    setBusy(true);
    try { setPhoto(await preparePhoto(file)); } catch (reason) { setError((reason as Error).message); } finally { setBusy(false); }
  };

  const save = async () => {
    setBusy(true);
    const day = today();
    const id = await db.drawings.add({
      date: new Date().toISOString(), moduleId: module?.id || step.moduleId, practiceId: exercise?.practiceId || null, sessionId: null,
      revisit: false, note: [guess && `Predicted: ${guess}`, note].filter(Boolean).join('\n'), checks,
      photo: photo?.photo || null, thumb: photo?.thumb || null, width: photo?.width || 0, height: photo?.height || 0, reference,
    });
    if (module) await db.progress.put(applyAttempt(module, progress.get(module.id), checks, day, false));
    onSaved(id as number);
  };

  return (
    <div className="stack gap-28" style={{ padding: '32px clamp(16px, 4vw, 48px)', maxWidth: 820, margin: '0 auto', width: '100%' }}>
      <div className="stack gap-10">
        <span className="sc">Check the page</span>
        <h2 className="disp" style={{ fontSize: 34, lineHeight: 1.08 }}>Photograph it, then answer in words</h2>
      </div>

      <label className={`dropzone${preview ? ' has' : ''}`}>
        {preview ? <img src={preview} alt="Your page" style={{ maxHeight: 360, objectFit: 'contain' }} /> : (
          <>
            <span className="read" style={{ fontSize: 19 }}>Photograph the page square on, in even light.</span>
            <span className="muted" style={{ fontSize: 14 }}>Or choose a photo. It is resized and kept only on this computer.</span>
          </>
        )}
        <input type="file" accept="image/*" capture="environment" onChange={(event) => void choose(event.target.files?.[0])} style={{ fontSize: 14 }} />
        {busy ? <span role="status" className="muted">Working</span> : null}
        {error ? <span role="alert" style={{ color: 'var(--warn)' }}>{error}</span> : null}
      </label>

      <label className="stack gap-6">
        <span className="read" style={{ fontSize: 18 }}>Before you look hard: where is it most off?</span>
        <input type="text" value={guess} onChange={(event) => setGuess(event.target.value)} placeholder="For example: the cube's right side leans too far" />
      </label>

      {module ? (
        <fieldset className="checks" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="read" style={{ fontSize: 18, marginBottom: 10 }}>{module.title}: the checks</legend>
          {module.done_when.map((check, index) => (
            <div key={check.text} className="check-row rule-top">
              <span className="read" style={{ fontSize: 17, lineHeight: 1.4 }}>{check.text} <span className="tag">{KIND_TEXT[check.kind]}</span></span>
              <Answers value={checks[index]} onChange={(answer) => setChecks({ ...checks, [index]: answer })} label={check.text} />
            </div>
          ))}
        </fieldset>
      ) : null}

      <label className="stack gap-6">
        <span className="read" style={{ fontSize: 18 }}>One line for next time</span>
        <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What to fix, in your own words" />
      </label>

      <div className="inline">
        <button type="button" className="btn" disabled={busy} onClick={() => void save()}>Save the page</button>
        <button type="button" className="link-button" onClick={onSkip}>Finish without saving</button>
      </div>
    </div>
  );
}
