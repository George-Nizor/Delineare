import { useEffect, useState } from 'react';
import pkg from '../../package.json';
import { href } from '../router';
import { useAppData } from '../store/appData';
import { deleteEverything, saveSetting, type Settings, type Theme } from '../store/db';

export function SettingsPage() {
  const { settings } = useAppData();
  // The screen follows a change at once; the store catches up a moment later.
  const [local, setLocal] = useState<Settings>(settings);
  const [confirming, setConfirming] = useState(false);
  useEffect(() => setLocal(settings), [settings]);
  const change = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setLocal((previous) => ({ ...previous, [key]: value }));
    void saveSetting(key, value);
  };
  const themes: [Theme, string][] = [['system', 'Match the computer'], ['light', 'Light'], ['dark', 'Dark']];

  return (
    <div className="page settings">
      <header className="page-head"><h1>Settings</h1></header>

      <fieldset className="setting">
        <legend>Theme</legend>
        {themes.map(([value, label]) => (
          <label key={value} className="radio">
            <input type="radio" name="theme" checked={local.theme === value} onChange={() => change('theme', value)} />
            {label}
          </label>
        ))}
      </fieldset>

      <fieldset className="setting">
        <legend>Lessons</legend>
        <label className="check-box">
          <input type="checkbox" checked={local.foldSteps} onChange={(event) => change('foldSteps', event.target.checked)} />
          <span>Fold the steps away on every lesson, for when you already draw and want the goal, the exercise and the check</span>
        </label>
        <label className="check-box">
          <input type="checkbox" checked={local.sound} onChange={(event) => change('sound', event.target.checked)} />
          <span>Play a quiet tone when a timer round ends</span>
        </label>
      </fieldset>

      <section className="setting">
        <h2>Your data</h2>
        <p>Your pages, practice history and settings stay in this app on this computer. Nothing is sent anywhere.</p>
        {confirming ? (
          <div className="actions">
            <button type="button" className="button danger" onClick={async () => { await deleteEverything(); setConfirming(false); }}>Delete all my pages and history</button>
            <button type="button" className="quiet" onClick={() => setConfirming(false)}>Keep everything</button>
          </div>
        ) : (
          <button type="button" className="quiet" onClick={() => setConfirming(true)}>Delete everything</button>
        )}
      </section>

      <p className="meta">Delineare {pkg.version} · <a href={href('credits')}>Teachers and credits</a></p>
    </div>
  );
}
