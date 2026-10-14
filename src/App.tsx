import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ContentContext, TOTAL_LESSONS, loadContent, useContent, writtenLessons } from './content/load';
import type { Content } from './content/types';
import { currentLesson, isFinished } from './engine/review';
import { Course } from './places/Course';
import { Credits } from './places/Credits';
import { DrawingDetail, Drawings } from './places/Drawings';
import { ExercisePage } from './places/Exercise';
import { Home } from './places/Home';
import { LessonPage, NotFound } from './places/Lesson';
import { Library } from './places/Library';
import { Practice } from './places/Practice';
import { SearchPage } from './places/Search';
import { SettingsPage } from './places/Settings';
import { Welcome } from './places/Welcome';
import { href, useRoute } from './router';
import { AppDataContext, useAppData, type AppData } from './store/appData';
import { db, readSettings } from './store/db';
import { Icon, type IconName } from './ui/Icons';
import { Mark } from './ui/Mark';
import { Splash } from './ui/Splash';

const PLACES: { route: string; label: string; icon: IconName }[] = [
  { route: '', label: 'Home', icon: 'home' },
  { route: 'course', label: 'Course', icon: 'course' },
  { route: 'practice', label: 'Practice', icon: 'practice' },
  { route: 'library', label: 'Library', icon: 'library' },
  { route: 'sketchbook', label: 'Sketchbook', icon: 'sketchbook' },
];

// The opening animation plays once per window, not on every reload of a route.
const splashSeen = () => {
  try { return sessionStorage.getItem('delineare-splash') === '1'; } catch { return false; }
};

export function App() {
  const [content, setContent] = useState<Content | null>(null);
  const [problem, setProblem] = useState('');
  const [splash, setSplash] = useState(() => !splashSeen());
  const route = useRoute();
  const records = useLiveQuery(() => db.lessons.toArray(), []);
  const log = useLiveQuery(() => db.log.toArray(), []);
  const settings = useLiveQuery(readSettings, []);

  useEffect(() => {
    loadContent().then(setContent, (error: unknown) => setProblem(error instanceof Error ? error.message : String(error)));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const theme = settings?.theme ?? 'system';
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    if (settings?.reduceMotion) root.dataset.motion = 'reduced';
    else delete root.dataset.motion;
  }, [settings?.theme, settings?.reduceMotion]);

  const endSplash = useCallback(() => {
    try { sessionStorage.setItem('delineare-splash', '1'); } catch { /* private window: it plays again next time */ }
    setSplash(false);
  }, []);

  const data = useMemo<AppData | null>(() => (records && log && settings ? { records: new Map(records.map((r) => [r.slug, r])), log, settings } : null), [records, log, settings]);
  const ready = Boolean((content && data) || problem);

  let body = null;
  if (problem) body = <main className="page"><h1>Delineare could not start</h1><p>{problem}</p></main>;
  else if (content && data) {
    body = (
      <ContentContext.Provider value={content}>
        <AppDataContext.Provider value={data}>
          <Shell route={route} />
        </AppDataContext.Provider>
      </ContentContext.Provider>
    );
  }

  return (
    <>
      {body}
      {splash ? <Splash ready={ready} onDone={endSplash} /> : null}
    </>
  );
}

function Shell({ route }: { route: string[] }) {
  const { records, log, settings } = useAppData();
  const [place = '', id] = route;
  const fresh = !settings.welcomed && records.size === 0 && log.length === 0;

  let page;
  switch (place) {
    case '': page = fresh ? <Welcome /> : <Home />; break;
    case 'welcome': page = <Welcome />; break;
    case 'course': page = <Course />; break;
    case 'lesson': page = <LessonPage slug={id ?? ''} />; break;
    case 'do': page = <ExercisePage practiceId={id} />; break;
    case 'free': page = <ExercisePage seed={Number(id) || 0} />; break;
    case 'practice': page = <Practice />; break;
    case 'library': page = <Library />; break;
    case 'sketchbook':
    case 'drawings': page = id ? <DrawingDetail id={Number(id)} /> : <Drawings />; break;
    case 'search': page = <SearchPage query={id ?? ''} />; break;
    case 'settings': page = <SettingsPage />; break;
    case 'credits': page = <Credits />; break;
    default: page = <NotFound />;
  }

  // The exercise fills the window: the reference, the steps and the clock, and nothing else.
  if (place === 'do' || place === 'free') return <div className="app app-exercise" key={route.join('/')}>{page}</div>;

  const active = place === 'lesson' ? 'course' : place === 'drawings' ? 'sketchbook' : place === '' && fresh ? 'welcome' : place;
  return (
    <div className="app">
      <Sidebar active={active} query={place === 'search' ? id ?? '' : ''} />
      <main className="main">
        <div className="page-enter" key={route.join('/')}>{page}</div>
      </main>
    </div>
  );
}

function Sidebar({ active, query }: { active: string; query: string }) {
  const content = useContent();
  const { records } = useAppData();
  const [text, setText] = useState(query);
  useEffect(() => setText(query), [query]);
  const written = writtenLessons(content);
  const current = currentLesson(written.map((lesson) => lesson.slug), records);
  const lesson = current ? content.lessons[current] : undefined;
  const total = TOTAL_LESSONS(content);
  const finished = content.parts.flatMap((part) => part.lessons).filter((entry) => isFinished(records.get(entry.slug))).length;
  const index = PLACES.findIndex((p) => p.route === active);

  const search = (value: string) => {
    setText(value);
    const target = value.trim() ? href('search', value) : href('course');
    if (value.trim() || active === 'search') window.location.replace(target);
  };

  return (
    <nav className="sidebar" aria-label="Delineare">
      <a className="brand" href={href()} aria-label="Delineare, home"><Mark size={32} /><span>Delineare</span></a>
      <label className="search">
        <Icon name="search" size={16} />
        <span className="visually-hidden">Search</span>
        <input type="search" placeholder="Search lessons, exercises, teachers" value={text} onChange={(event) => search(event.target.value)} />
      </label>
      <div className="places" style={{ '--active': index } as CSSProperties}>
        {index >= 0 ? <span className="places-indicator" aria-hidden="true" /> : null}
        {PLACES.map((p) => (
          <a key={p.label} className="place" href={href(...(p.route ? [p.route] : []))} aria-current={active === p.route ? 'page' : undefined}>
            <Icon name={p.icon} />{p.label}
          </a>
        ))}
      </div>
      <div className="course-box">
        {lesson ? (
          <>
            <span className="course-box-title">Lesson {lesson.number} of {total}</span>
            <span className="bar" aria-hidden="true"><span style={{ width: `${Math.max(3, (finished / total) * 100)}%` }} /></span>
            <a href={href('lesson', lesson.slug)}>Continue: {lesson.title}</a>
          </>
        ) : (
          <>
            <span className="course-box-title">Every lesson is done</span>
            <a href={href('practice')}>Keep practising</a>
          </>
        )}
      </div>
      <div className="sidebar-foot">
        <a className="place small" href={href('welcome')} aria-current={active === 'welcome' ? 'page' : undefined}><Icon name="help" size={18} />How Delineare works</a>
        <a className="place small" href={href('settings')} aria-current={active === 'settings' || active === 'credits' ? 'page' : undefined}><Icon name="settings" size={18} />Settings</a>
      </div>
    </nav>
  );
}
