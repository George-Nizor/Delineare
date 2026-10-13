import { useEffect, useState } from 'react';
import { useApp, type Theme } from '../app/state';
import { db } from '../store/db';
import { exportAll, importAll } from '../store/backup';

// The plan, the theme, and everything stored: how much, export, import.
export function Settings() {
  const { course, settings, update } = useApp();
  const [usage, setUsage] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const template = course.data.weekly_templates.find((entry) => entry.id === settings.template);

  useEffect(() => {
    void Promise.all([db.drawings.count(), navigator.storage?.estimate?.().catch(() => null)]).then(([count, estimate]) => {
      const megabytes = estimate?.usage ? `${(estimate.usage / 1048576).toFixed(1)} MB` : 'an unknown amount';
      setUsage(`${count} logged ${count === 1 ? 'page' : 'pages'}, using ${megabytes} on this computer.`);
    });
  }, [message]);

  const save = async () => {
    setBusy(true);
    try {
      const blob = await exportAll();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `delineare-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setMessage('Exported. Keep the zip somewhere safe; it is the only copy outside this computer.');
    } catch (error) {
      setMessage(`The export failed: ${(error as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const load = async (file: File | undefined) => {
    if (!file || !window.confirm('Importing replaces everything stored here with the contents of the file. Go ahead?')) return;
    setBusy(true);
    try {
      const counts = await importAll(file);
      setMessage(`Imported ${counts.drawings} pages, ${counts.sessions} sessions and progress on ${counts.modules} chapters.`);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="page stack gap-40" aria-labelledby="settings-title" style={{ maxWidth: 860 }}>
      <header className="stack gap-10">
        <span className="sc">Settings</span>
        <h1 id="settings-title" className="disp chapter-title">Your plan and your data</h1>
      </header>

      <section className="stack gap-14">
        <h2 className="section-title">Plan</h2>
        <div className="segmented" role="group" aria-label="Hours a week">
          {course.data.weekly_templates.map((entry) => (
            <button key={entry.id} type="button" aria-pressed={settings.template === entry.id} onClick={() => update('template', entry.id)}>
              {entry.hours_per_week} h a week
            </button>
          ))}
        </div>
        {template ? (
          <div className="stack gap-10">
            <p className="read" style={{ fontSize: 17, lineHeight: 1.5 }}>{template.description}</p>
            <ul className="steps">
              {template.sessions.map((session) => (
                <li key={session.day + session.focus}>
                  <span className="mono" style={{ textAlign: 'left' }}>{session.day.slice(0, 3)}</span>
                  <span className="read" style={{ fontSize: 16 }}>{session.focus}</span>
                  <span className="mono">{session.minutes} min</span>
                </li>
              ))}
            </ul>
            <p className="caption">A missed session is dropped, not added to the next one.</p>
          </div>
        ) : null}
      </section>

      <section className="stack gap-14">
        <h2 className="section-title">Theme</h2>
        <div className="segmented" role="group" aria-label="Theme">
          {(['system', 'light', 'dark'] as Theme[]).map((value) => (
            <button key={value} type="button" aria-pressed={settings.theme === value} onClick={() => update('theme', value)}>
              {value === 'system' ? 'Match the system' : value === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
        <p className="caption">References always sit on neutral grey, whichever theme you choose.</p>
      </section>

      <section className="stack gap-14">
        <h2 className="section-title">Your data</h2>
        <p className="read" style={{ fontSize: 17 }}>{usage || 'Measuring'} Nothing is sent anywhere; there is no account.</p>
        <div className="inline">
          <button type="button" className="btn small" disabled={busy} onClick={() => void save()}>Export everything</button>
          <label className="ghost" style={{ cursor: 'pointer' }}>
            Import a backup
            <input type="file" accept=".zip,application/zip" className="visually-hidden" onChange={(event) => void load(event.target.files?.[0])} />
          </label>
        </div>
        {message ? <p role="status" className="read" style={{ fontSize: 16 }}>{message}</p> : null}
      </section>

      <section className="stack gap-10">
        <h2 className="section-title">About</h2>
        <p className="read" style={{ fontSize: 16, lineHeight: 1.55 }}>
          Delineare is part of Instrumenta, by Bonehead Labs. Type: Fraunces, Commissioner, Spline Sans Mono and Newsreader, all under
          the SIL Open Font License. Curriculum generated {course.data.meta.generated}; {course.data.meta.module_count} chapters,
          {` ${course.data.meta.resource_count}`} linked resources. Keys in a session: Space pauses, the arrows change the reference,
          F flips, G greys, R lays a grid, B squints, N moves on, Escape ends.
        </p>
      </section>
    </article>
  );
}
