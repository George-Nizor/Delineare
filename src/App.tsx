import { useEffect, useState, type ReactNode } from 'react';
import { loadCourse, ROMAN, type Course } from './data/load';
import { AppProvider, href, useApp, useRoute, type Route } from './app/state';
import { Mark } from './components/Mark';
import { currentModule } from './engine/plan';
import { Today } from './screens/Today';
import { Contents } from './screens/Contents';
import { ModulePage } from './screens/ModulePage';
import { Session } from './screens/Session';
import { Drawings, DrawingPage } from './screens/Drawings';
import { Library } from './screens/Library';
import { ToolPage } from './screens/ToolPage';
import { Sources } from './screens/Sources';
import { Settings } from './screens/Settings';

export function App() {
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    loadCourse().then(setCourse, (reason: Error) => setError(reason.message));
  }, []);
  if (error) return <Fallback title="The curriculum did not load">{error}</Fallback>;
  if (!course) return <Fallback title="Opening the book" />;
  return (
    <AppProvider course={course}>
      <Pages />
    </AppProvider>
  );
}

function Fallback({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="shell"><main className="desk"><div className="page stack gap-14" role="status">
      <Mark size={48} playing={!children} />
      <h1 className="section-title">{title}</h1>
      {children ? <p className="read">{children}</p> : null}
    </div></main></div>
  );
}

const NAV: { label: string; route: Route; pages: Route['page'][] }[] = [
  { label: 'Today', route: { page: 'today' }, pages: ['today'] },
  { label: 'Contents', route: { page: 'contents' }, pages: ['contents', 'module'] },
  { label: 'Drawings', route: { page: 'drawings' }, pages: ['drawings', 'drawing'] },
  { label: 'Library', route: { page: 'library' }, pages: ['library', 'tool'] },
  { label: 'Sources', route: { page: 'sources' }, pages: ['sources'] },
  { label: 'Settings', route: { page: 'settings' }, pages: ['settings'] },
];

function Pages() {
  const route = useRoute();
  const { course, progress, settings } = useApp();
  if (route.page === 'session') return <Session route={route} />;
  // The running head names the phase being studied, as a book's does.
  const shown = route.page === 'module' ? course.module.get(route.id) : currentModule(course, progress, settings.focusModule);
  const phase = shown ? course.data.phases.find((entry) => entry.number === shown.phase) : null;
  return (
    <div className="shell">
      <header className="top">
        <a className="brand ii-hover" href={href({ page: 'today' })}><Mark size={32} /><span className="disp">Delineare</span></a>
        <span className="runhead sc">{phase ? `Phase ${ROMAN[phase.number]} · ${phase.title}` : ''}</span>
        <nav className="nav" aria-label="Main">
          {NAV.map((item) => (
            <a key={item.label} href={href(item.route)} aria-current={item.pages.includes(route.page) ? 'page' : undefined}>{item.label}</a>
          ))}
        </nav>
      </header>
      <main className="desk" id="main">
        {route.page === 'today' && <Today />}
        {route.page === 'contents' && <Contents />}
        {route.page === 'module' && <ModulePage id={route.id} />}
        {route.page === 'drawings' && <Drawings moduleId={route.moduleId} />}
        {route.page === 'drawing' && <DrawingPage id={route.id} />}
        {route.page === 'library' && <Library />}
        {route.page === 'tool' && <ToolPage name={route.name} />}
        {route.page === 'sources' && <Sources />}
        {route.page === 'settings' && <Settings />}
      </main>
    </div>
  );
}
