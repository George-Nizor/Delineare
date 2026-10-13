import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { go, href, useApp, type Route } from '../app/state';
import type { Module } from '../data/types';
import { minutesText, roman } from '../components/bits';
import { applyAttempt, planFor, revisitOf, slotFor, today, type Plan, type Step } from '../engine/plan';
import { db, type CheckAnswer, type ReferenceRecord } from '../store/db';
import { creditLine } from '../references/museums';
import { makePrompt, type Prompt } from '../references/prompts';
import { useReferences } from '../references/useReferences';
import { chime, clock, useTimer, useWakeLock } from '../session/useTimer';
import { LogPage } from '../session/LogPage';
import { Answers } from '../components/Answers';
import { isTool, ToolView } from '../tools/ToolView';

type SessionRoute = Extract<Route, { page: 'session' }>;

function practicePlan(module: Module, practiceId: string | undefined): Plan {
  const practice = module.practice.find((item) => item.id === practiceId) || module.practice[0]!;
  const steps: Step[] = [
    { kind: 'exercise', title: practice.title, description: practice.description, minutes: practice.minutes, timer: practice.timer,
      reference: practice.reference, moduleId: module.id, practiceId: practice.id },
    { kind: 'log', title: 'Photograph the page and check it', description: `Answer the checks for ${module.title}.`, minutes: 3,
      timer: { mode: 'single', minutes: 3 }, reference: { kind: 'none', query: null, tool: null, site: null, url: null }, moduleId: module.id, practiceId: null },
  ];
  return { title: practice.title, minutes: practice.minutes + 3, focus: '', steps, module, short: false };
}

// The session runner. The reference fills the window on neutral grey, because the colour around
// an image changes how its values read; the panel holds the time, the part and the controls.
export function Session({ route }: { route: SessionRoute }) {
  const { course, progress, logged, settings } = useApp();
  const day = today();
  const [plan] = useState<Plan | null>(() => {
    if (route.mode === 'practice') {
      const module = route.moduleId ? course.module.get(route.moduleId) : undefined;
      return module && module.practice.length ? practicePlan(module, route.practiceId) : null;
    }
    return planFor(slotFor(course, settings.template, day), {
      course, progress, logged, day, templateId: settings.template, chosenModule: settings.focusModule, short: route.mode === 'short',
    });
  });
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState<number | null>(null);
  const started = useRef(new Date().toISOString());
  const spent = useRef(0);
  const [stepsDone, setStepsDone] = useState<boolean[]>([]);
  const [lastReference, setLastReference] = useState<ReferenceRecord | null>(null);
  useWakeLock(finished === null);

  const finish = useCallback(async (drawingId: number | null) => {
    if (!plan) return;
    await db.sessions.add({
      date: started.current, plannedMinutes: plan.minutes, spentSeconds: Math.round(spent.current), short: plan.short,
      steps: plan.steps.map((step, at) => ({ kind: step.kind, title: step.title, moduleId: step.moduleId, practiceId: step.practiceId, minutes: step.minutes, done: Boolean(stepsDone[at]) || at <= index })),
    });
    setFinished(drawingId ?? -1);
  }, [plan, stepsDone, index]);

  if (!plan || !plan.steps.length) {
    return (
      <div className="shell"><main className="desk"><article className="page stack gap-14">
        <h1 className="section-title">Nothing to practise here</h1>
        <p className="read">This chapter has no exercises yet, or none of the open chapters do.</p>
        <a href={href({ page: 'today' })}>Back to today</a>
      </article></main></div>
    );
  }
  if (finished !== null) return <Finished plan={plan} drawingId={finished > 0 ? finished : null} minutes={Math.round(spent.current / 60)} />;

  const step = plan.steps[index]!;
  const next = () => {
    setStepsDone((done) => { const copy = [...done]; copy[index] = true; return copy; });
    if (index < plan.steps.length - 1) { setIndex(index + 1); setRunning(true); }
  };

  return (
    <StepView
      key={index}
      plan={plan}
      index={index}
      step={step}
      running={running}
      setRunning={setRunning}
      onSeconds={(seconds) => { spent.current += seconds; }}
      onNext={next}
      onFinish={finish}
      stepsDone={stepsDone}
      lastReference={lastReference}
      onReference={setLastReference}
    />
  );
}

interface StepViewProps {
  plan: Plan;
  index: number;
  step: Step;
  running: boolean;
  setRunning: (value: boolean) => void;
  onSeconds: (seconds: number) => void;
  onNext: () => void;
  onFinish: (drawingId: number | null) => Promise<void>;
  stepsDone: boolean[];
  lastReference: ReferenceRecord | null;
  onReference: (reference: ReferenceRecord | null) => void;
}

function StepView({ plan, index, step, running, setRunning, onSeconds, onNext, onFinish, stepsDone, lastReference, onReference }: StepViewProps) {
  const { course, progress } = useApp();
  const module = step.moduleId ? course.module.get(step.moduleId) || null : null;
  const isLog = step.kind === 'log';
  const timer = useTimer(step.timer, running && !isLog, index);
  const [figureFallback, setFigureFallback] = useState(false);
  const references = useReferences(figureFallback ? { kind: 'museum', query: 'figure study', tool: null, site: null, url: null } : step.reference);
  const [refIndex, setRefIndex] = useState(0);
  const [flip, setFlip] = useState(false);
  const [grey, setGrey] = useState(false);
  const [grid, setGrid] = useState(false);
  const [squint, setSquint] = useState(false);
  const [sound, setSound] = useState(true);
  const [prompt, setPrompt] = useState<Prompt>(() => makePrompt());
  const [revisitChecks, setRevisitChecks] = useState<Record<number, CheckAnswer>>({});
  const lastPose = useRef(0);
  const lastElapsed = useRef(0);
  const ended = useRef(false);

  // Count time actually spent, and move to the next reference when a timed pose changes.
  useEffect(() => {
    onSeconds(Math.max(0, timer.elapsed - lastElapsed.current));
    lastElapsed.current = timer.elapsed;
    if (timer.pose !== lastPose.current) {
      lastPose.current = timer.pose;
      if (references.items.length > 1) setRefIndex((value) => (value + 1) % references.items.length);
      if (sound) chime();
    }
    if (timer.done && !ended.current && !isLog) {
      ended.current = true;
      if (sound) chime(true);
    }
  }, [timer.elapsed, timer.pose, timer.done, references.items.length, sound, onSeconds, isLog]);

  const shownRef: ReferenceRecord | undefined = references.items[refIndex % Math.max(1, references.items.length)];
  // The page logged at the end is compared with the reference the exercise was drawn from.
  useEffect(() => {
    if ((step.kind === 'exercise' || step.kind === 'play') && shownRef) onReference(shownRef);
  }, [shownRef, step.kind, onReference]);
  const moveRef = useCallback((by: number) => {
    if (references.items.length) setRefIndex((value) => (value + by + references.items.length) % references.items.length);
  }, [references.items.length]);

  const end = useCallback(() => {
    if (window.confirm('End this session now? What you logged is kept.')) void onFinish(null);
  }, [onFinish]);

  const saveRevisit = useCallback(async () => {
    if (module && Object.keys(revisitChecks).length) {
      const day = today();
      await db.drawings.add({
        date: new Date().toISOString(), moduleId: module.id, practiceId: null, sessionId: null, revisit: true, note: '',
        checks: revisitChecks, photo: null, thumb: null, width: 0, height: 0, reference: null,
      });
      await db.progress.put(applyAttempt(module, progress.get(module.id), revisitChecks, day, true));
    }
    onNext();
  }, [module, revisitChecks, progress, onNext]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === ' ' && !isLog) { event.preventDefault(); setRunning(!running); }
      else if (key === 'arrowright') moveRef(1);
      else if (key === 'arrowleft') moveRef(-1);
      else if (key === 'f') setFlip((value) => !value);
      else if (key === 'g') setGrey((value) => !value);
      else if (key === 'b') setSquint((value) => !value);
      else if (key === 'r') setGrid((value) => !value);
      else if (key === 'n' && !isLog && step.kind !== 'revisit') onNext();
      else if (key === 'escape') end();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running, setRunning, moveRef, onNext, end, isLog, step.kind]);

  const site = siteFor(course, step);
  const classes = ['viewer', flip && 'flip', grey && 'grey', squint && 'squint'].filter(Boolean).join(' ');
  const percent = timer.total ? Math.min(100, (timer.elapsed / timer.total) * 100) : 0;

  return (
    <div className="session" role="main" aria-label="Session">
      <div className="session-head">
        <span className="sc">Part {roman(index + 1)} of {roman(plan.steps.length)}</span>
        <button type="button" className="link-button" onClick={end}>End</button>
      </div>
      {isLog ? (
        <div className="viewer" style={{ background: 'var(--page)', placeItems: 'stretch', overflowY: 'auto' }}>
          <LogPage plan={plan} step={step} module={module} reference={lastReference} onSaved={(id) => void onFinish(id)} onSkip={() => void onFinish(null)} />
        </div>
      ) : (
        <div className={classes}>
          {step.reference.kind === 'tool' && isTool(step.reference.tool) ? (
            <ToolView tool={step.reference.tool} compact />
          ) : shownRef ? (
            <div className="frame">
              <img className="ref" src={shownRef.image} alt={`Reference: ${shownRef.title}`} referrerPolicy="no-referrer" />
              {grid ? <div className="grid-lines" aria-hidden="true">{Array.from({ length: 9 }, (_, at) => <span key={at} />)}</div> : null}
              <span className="credit">
                {creditLine(shownRef)}{shownRef.link ? <> <a href={shownRef.link} target="_blank" rel="noopener noreferrer">Source</a></> : null}
                {references.items.length > 1 ? ` ${refIndex + 1} of ${references.items.length}` : ''}
              </span>
            </div>
          ) : (
            <ViewerMessage step={step} module={module} loading={references.loading} prompt={prompt} newPrompt={() => setPrompt(makePrompt())}
              site={site} useFigures={() => setFigureFallback(true)} done={timer.done} />
          )}
        </div>
      )}

      <aside className="panel" aria-label="Time and controls">
        <div className="stack gap-6 hide-small">
          <div className="between"><span className="sc">Part {roman(index + 1)} of {roman(plan.steps.length)}</span><button type="button" className="link-button" onClick={end}>End session</button></div>
        </div>
        <div className="stack gap-6">
          <h1 className="disp" style={{ fontSize: 26, lineHeight: 1.12 }}>{step.title}</h1>
          <p className="read muted" style={{ fontSize: 16, lineHeight: 1.45 }}>{step.description}</p>
        </div>

        {isLog ? null : (
          <>
            <div className="stack gap-10">
              <div className="between" style={{ alignItems: 'baseline' }}>
                <span className="timer" role="timer" aria-live="off" aria-label={`${clock(step.timer.mode === 'ladder' ? timer.poseLeft : timer.left)} left`}>
                  {clock(step.timer.mode === 'ladder' ? timer.poseLeft : timer.left)}
                </span>
                <span className="read italic muted">
                  {step.timer.mode === 'ladder' ? `pose ${timer.pose + 1} of ${timer.poses}` : `of ${minutesText(step.minutes)}`}
                </span>
              </div>
              <div className="progress" aria-hidden="true"><span style={{ width: `${percent}%` }} /></div>
              {timer.done ? <p className="read" role="status">Time. Finish the line you are on, then move on.</p> : null}
            </div>
            <div className="toolrow" role="toolbar" aria-label="Reference tools">
              <button type="button" aria-pressed={flip} onClick={() => setFlip(!flip)}>Flip<span className="kbd">F</span></button>
              <button type="button" aria-pressed={grey} onClick={() => setGrey(!grey)}>Grey<span className="kbd">G</span></button>
              <button type="button" aria-pressed={grid} onClick={() => setGrid(!grid)}>Grid<span className="kbd">R</span></button>
              <button type="button" aria-pressed={squint} onClick={() => setSquint(!squint)}>Squint<span className="kbd">B</span></button>
              <button type="button" onClick={() => moveRef(1)} disabled={references.items.length < 2}>Next<span className="kbd">→</span></button>
            </div>
          </>
        )}

        {step.kind === 'revisit' && module ? (
          <RevisitChecks module={module} checks={revisitChecks} setChecks={setRevisitChecks} />
        ) : null}

        {isLog ? null : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: 10 }}>
            {step.kind === 'revisit'
              ? <button type="button" className="ghost large" onClick={() => void saveRevisit()}>{Object.keys(revisitChecks).length ? 'Save and go on' : 'Skip'}</button>
              : <button type="button" className="ghost large" onClick={onNext}>{timer.done ? 'Next part' : 'Done early'}</button>}
            <button type="button" className="btn" onClick={() => setRunning(!running)} disabled={timer.done}>
              {running ? 'Pause' : 'Resume'} <span className="kbd hide-small">Space</span>
            </button>
          </div>
        )}

        <ol className="step-list hide-small" aria-label="Parts of this session">
          {plan.steps.map((item, at) => (
            <li key={`${item.kind}-${at}`} aria-current={at === index ? 'step' : undefined} className={stepsDone[at] ? 'done' : undefined}>
              <span className="numeral" style={{ fontSize: 16 }}>{roman(at + 1)}.</span>
              <span>{item.title}</span>
              <span className="mono" style={{ fontSize: 12 }}>{minutesText(item.minutes)}</span>
            </li>
          ))}
        </ol>
        <label className="inline hide-small muted" style={{ fontSize: 13, gap: 8 }}>
          <input type="checkbox" checked={sound} onChange={(event) => setSound(event.target.checked)} /> A quiet tone when a pose or part ends
        </label>
      </aside>
    </div>
  );
}

// Where a timed pose session happens: a library entry or a resource named by the data, or failing
// that whatever library entry shares the address's host, so the button always names the site.
function siteFor(course: ReturnType<typeof useApp>['course'], step: Step): { name: string; url: string } | null {
  const reference = step.reference;
  if (reference.kind !== 'pose-site') return null;
  const library = course.data.library;
  const byTitle = library.find((item) => item.title.toLowerCase() === (reference.site || '').toLowerCase());
  const resource = reference.site ? course.resource.get(reference.site) : undefined;
  const url = reference.url || byTitle?.url || resource?.url || library.find((item) => item.type === 'timed-reference')?.url || '';
  if (!url) return null;
  let host = '';
  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
  const sameHost = library.find((item) => { try { return new URL(item.url).hostname.replace(/^www\./, '') === host; } catch { return false; } });
  const name = byTitle?.title || sameHost?.title || resource?.provider || host;
  return { name, url };
}

function ViewerMessage({ step, module, loading, prompt, newPrompt, site, useFigures, done }: {
  step: Step; module: Module | null; loading: boolean; prompt: Prompt; newPrompt: () => void;
  site: { name: string; url: string } | null; useFigures: () => void; done: boolean;
}) {
  const kind = step.reference.kind;
  if (loading) return <div className="viewer-message"><p className="big">Finding a reference</p></div>;
  if (kind === 'prompt' || step.kind === 'play') {
    return (
      <div className="viewer-message">
        <span className="sc" style={{ color: '#CFCFCF' }}>Draw this</span>
        <p className="prompt-card">{prompt.text}</p>
        <button type="button" className="link-button" onClick={newPrompt}>Another prompt</button>
      </div>
    );
  }
  if (kind === 'pose-site') {
    return (
      <div className="viewer-message">
        <p className="big">Timed poses from {site?.name || 'a pose site'}</p>
        <p>Set its timer to match, or ignore its timer and follow this one.</p>
        {site ? <a className="btn" href={site.url} target="_blank" rel="noopener noreferrer">Open {site.name}</a> : null}
        <button type="button" className="link-button" onClick={useFigures}>Use museum figure drawings here instead</button>
      </div>
    );
  }
  if (kind === 'memory' || step.kind === 'revisit') {
    return (
      <div className="viewer-message">
        <p className="big">Lesson closed. Draw it from memory.</p>
        <p>Use a new subject, not the one you drew last time.</p>
        {done && module ? <a href={href({ page: 'module', id: module.id })} target="_blank" rel="noopener noreferrer">Open the chapter to compare</a> : null}
      </div>
    );
  }
  if (kind === 'life') return <div className="viewer-message"><p className="big">Draw from life.</p><p>{step.description}</p></div>;
  return <div className="viewer-message"><p className="big">Just the page and the clock.</p></div>;
}

function RevisitChecks({ module, checks, setChecks }: { module: Module; checks: Record<number, CheckAnswer>; setChecks: (value: Record<number, CheckAnswer>) => void }) {
  const indexes = revisitOf(module).checks.length ? revisitOf(module).checks : module.done_when.map((_, index) => index);
  return (
    <fieldset className="stack gap-10" style={{ border: 0, padding: 0, margin: 0 }}>
      <legend className="sc" style={{ marginBottom: 8 }}>Did it hold?</legend>
      {indexes.map((at) => {
        const check = module.done_when[at];
        if (!check) return null;
        return (
          <div key={at} className="stack gap-6">
            <span className="read" style={{ fontSize: 15 }}>{check.text}</span>
            <Answers value={checks[at]} onChange={(answer) => setChecks({ ...checks, [at]: answer })} label={check.text} />
          </div>
        );
      })}
    </fieldset>
  );
}

function Finished({ plan, drawingId, minutes }: { plan: Plan; drawingId: number | null; minutes: number }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const next = useMemo(() => plan.module, [plan.module]);
  return (
    <div className="shell"><main className="desk"><article className="page stack gap-20" style={{ maxWidth: 760 }}>
      <span className="sc">Session finished</span>
      <h1 ref={ref} tabIndex={-1} className="disp chapter-title">That is today's drawing</h1>
      <p className="read" style={{ fontSize: 20 }}>{minutes ? `${minutesText(minutes)} at the page.` : 'Short and done.'} {drawingId ? 'Your page is saved with its checks.' : 'Nothing was photographed this time.'}</p>
      <div className="inline">
        <a className="btn" href={href({ page: 'today' })}>Back to today</a>
        {drawingId ? <a href={href({ page: 'drawing', id: drawingId })}>See the page</a> : null}
        {next ? <a href={href({ page: 'module', id: next.id })}>Open {next.title}</a> : null}
      </div>
    </article></main></div>
  );
}

export function leaveSession(): void {
  go({ page: 'today' });
}
