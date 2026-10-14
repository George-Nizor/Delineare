import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { ContentContext, loadContent } from './content/load';
import type { Content } from './content/types';
import { Course } from './places/Course';
import { Credits } from './places/Credits';
import { DrawingDetail, Drawings } from './places/Drawings';
import { ExercisePage } from './places/Exercise';
import { Home } from './places/Home';
import { LessonPage, NotFound } from './places/Lesson';
import { Practice } from './places/Practice';
import { SettingsPage } from './places/Settings';
import { href, useRoute } from './router';
import { AppDataContext, type AppData } from './store/appData';
import { db, readSettings } from './store/db';
import { Mark } from './ui/Mark';

const PLACES = [
  { route: '', label: 'Home' },
  { route: 'course', label: 'Course' },
  { route: 'practice', label: 'Practise' },
  { route: 'drawings', label: 'Drawings' },
] as const;

export function App() {
  const [content, setContent] = useState<Content | null>(null);
  const [problem, setProblem] = useState('');
  const route = useRoute();
  const records = useLiveQuery(() => db.lessons.toArray(), []);
  const log = useLiveQuery(() => db.log.toArray(), []);
  const settings = useLiveQuery(readSettings, []);

  useEffect(() => {
    loadContent().then(setContent, (error: unknown) => setProblem(error instanceof Error ? error.message : String(error)));
  }, []);

  useEffect(() => {
    const theme = settings?.theme ?? 'system';
    if (theme === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  }, [settings?.theme]);

  const data = useMemo<AppData | null>(() => (records && log && settings ? { records: new Map(records.map((r) => [r.slug, r])), log, settings } : null), [records, log, settings]);

  if (problem) return <main className="page"><h1>Delineare could not start</h1><p>{problem}</p></main>;
  if (!content || !data) return <main className="page loading" aria-busy="true" />;

  const [place = '', id] = route;
  const exercise = place === 'do' || place === 'free';
  let page;
  switch (place) {
    case '': page = <Home />; break;
    case 'course': page = <Course />; break;
    case 'lesson': page = <LessonPage slug={id ?? ''} />; break;
    case 'do': page = <ExercisePage practiceId={id} />; break;
    case 'free': page = <ExercisePage seed={Number(id) || 0} />; break;
    case 'practice': page = <Practice />; break;
    case 'drawings': page = id ? <DrawingDetail id={Number(id)} /> : <Drawings />; break;
    case 'settings': page = <SettingsPage />; break;
    case 'credits': page = <Credits />; break;
    default: page = <NotFound />;
  }
  const active = place === 'lesson' ? 'course' : place;

  return (
    <ContentContext.Provider value={content}>
      <AppDataContext.Provider value={data}>
        <div className={`app ${exercise ? 'app-exercise' : ''}`}>
          <header className="top">
            <a className="brand" href={href()} aria-label="Delineare, home"><Mark size={24} /><span>Delineare</span></a>
            <nav className="places" aria-label="Places">
              {PLACES.map((p) => (
                <a key={p.route} href={href(...(p.route ? [p.route] : []))} aria-current={active === p.route ? 'page' : undefined}>{p.label}</a>
              ))}
            </nav>
            <a className="settings-link" href={href('settings')} aria-current={place === 'settings' || place === 'credits' ? 'page' : undefined}>Settings</a>
          </header>
          <main>{page}</main>
        </div>
      </AppDataContext.Provider>
    </ContentContext.Provider>
  );
}
