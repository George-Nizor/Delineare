import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Course } from '../data/load';
import { db, setSetting, type Progress } from '../store/db';
import type { ProgressMap } from '../engine/plan';

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  theme: Theme;
  template: string;
  focusModule: string | null;
}

interface AppState {
  course: Course;
  progress: ProgressMap;
  logged: Set<string>;
  settings: Settings;
  update: (key: keyof Settings, value: Settings[keyof Settings]) => void;
}

const Context = createContext<AppState | null>(null);

export function AppProvider({ course, children }: { course: Course; children: ReactNode }) {
  const rows = useLiveQuery(() => db.progress.toArray(), [], [] as Progress[]);
  const practised = useLiveQuery(() => db.drawings.toArray().then((all) => all.map((drawing) => drawing.practiceId).filter(Boolean) as string[]), [], [] as string[]);
  const stored = useLiveQuery(() => db.settings.toArray(), [], undefined);
  const defaultTemplate = course.data.weekly_templates.find((template) => template.hours_per_week === 3)?.id
    || course.data.weekly_templates[0]?.id || '';
  const settings = useMemo<Settings>(() => {
    const get = (key: string) => stored?.find((row) => row.key === key)?.value;
    return {
      theme: (get('theme') as Theme) || 'system',
      template: (get('template') as string) || defaultTemplate,
      focusModule: (get('focusModule') as string | null) ?? null,
    };
  }, [stored, defaultTemplate]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = settings.theme;
  }, [settings.theme]);

  const value = useMemo<AppState>(() => ({
    course,
    progress: new Map(rows.map((row) => [row.moduleId, row])),
    logged: new Set(practised),
    settings,
    update: (key, next) => { void setSetting(key, next); },
  }), [course, rows, practised, settings]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp(): AppState {
  const value = useContext(Context);
  if (!value) throw new Error('useApp is used outside AppProvider.');
  return value;
}

// ---- Routing: the hash holds the page, so a reload or the launcher's window keeps its place. --

export type Route =
  | { page: 'today' }
  | { page: 'contents' }
  | { page: 'module'; id: string }
  | { page: 'session'; mode: 'today' | 'short' | 'practice'; moduleId?: string; practiceId?: string }
  | { page: 'drawings'; moduleId?: string }
  | { page: 'drawing'; id: number }
  | { page: 'library' }
  | { page: 'tool'; name: string }
  | { page: 'sources' }
  | { page: 'settings' };

export function parseRoute(hash: string): Route {
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(query);
  const [first, second, third] = path.split('/').map(decodeURIComponent);
  switch (first) {
    case 'contents': return { page: 'contents' };
    case 'module': return second ? { page: 'module', id: second } : { page: 'contents' };
    case 'session':
      if (second === 'practice' && third) return { page: 'session', mode: 'practice', moduleId: third, practiceId: params.get('p') || undefined };
      return { page: 'session', mode: second === 'short' ? 'short' : 'today' };
    case 'drawings': return { page: 'drawings', moduleId: params.get('module') || undefined };
    case 'drawing': return Number(second) > 0 ? { page: 'drawing', id: Number(second) } : { page: 'drawings' };
    case 'library': return { page: 'library' };
    case 'tool': return second ? { page: 'tool', name: second } : { page: 'library' };
    case 'sources': return { page: 'sources' };
    case 'settings': return { page: 'settings' };
    default: return { page: 'today' };
  }
}

export function href(route: Route): string {
  switch (route.page) {
    case 'today': return '#/';
    case 'module': return `#/module/${encodeURIComponent(route.id)}`;
    case 'session':
      if (route.mode === 'practice') return `#/session/practice/${encodeURIComponent(route.moduleId || '')}${route.practiceId ? `?p=${encodeURIComponent(route.practiceId)}` : ''}`;
      return route.mode === 'short' ? '#/session/short' : '#/session';
    case 'drawings': return route.moduleId ? `#/drawings?module=${encodeURIComponent(route.moduleId)}` : '#/drawings';
    case 'drawing': return `#/drawing/${route.id}`;
    case 'tool': return `#/tool/${encodeURIComponent(route.name)}`;
    default: return `#/${route.page}`;
  }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function go(route: Route): void {
  window.location.hash = href(route);
}
