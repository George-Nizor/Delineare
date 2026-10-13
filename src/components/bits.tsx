import { useEffect, useMemo, useState } from 'react';
import type { Course } from '../data/load';
import type { Module, ModuleResource, Resource } from '../data/types';
import type { Status } from '../engine/plan';

// Labels that say plainly what is known about a link: what it costs, whether anyone has opened it,
// and whether the last check could reach it. They are words, never colour alone.
export function resourceLabels(resource: Resource): { text: string; tone: 'plain' | 'warn' | 'good' }[] {
  const labels: { text: string; tone: 'plain' | 'warn' | 'good' }[] = [];
  labels.push({ text: resource.cost === 'free' ? 'Free' : resource.cost === 'free-tier' ? 'Part free' : 'Paid', tone: resource.cost === 'paid' ? 'warn' : 'plain' });
  if (resource.format) labels.push({ text: resource.format, tone: 'plain' });
  if (!resource.verified) labels.push({ text: 'Unverified', tone: 'warn' });
  if (resource.link_status && ['dead', 'unreachable', 'error'].includes(resource.link_status)) labels.push({ text: 'Link problem', tone: 'warn' });
  else if (resource.link_status === 'blocked') labels.push({ text: 'Site blocks link checks', tone: 'plain' });
  return labels;
}

export function Labels({ resource }: { resource: Resource }) {
  return (
    <span className="labels">
      {resourceLabels(resource).map((label) => (
        <span key={label.text} className={`tag${label.tone === 'plain' ? '' : ` ${label.tone}`}`}>{label.text}</span>
      ))}
    </span>
  );
}

// A resource as a footnote: the title links out (the launcher opens it in the browser), the
// provider is credited, and our note says what to watch for.
export function Footnote({ entry, resource }: { entry: ModuleResource; resource: Resource }) {
  return (
    <li>
      <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}</a>
      {'. '}{resource.credit && resource.credit !== resource.provider ? `${resource.provider}, ${resource.credit}` : resource.provider}.
      {entry.role === 'core' ? <span className="sc" style={{ marginLeft: 8 }}>Start here</span> : null}
      <Labels resource={resource} />
      {entry.notes ? <span className="muted" style={{ display: 'block', fontSize: 15, marginTop: 4 }}>{entry.notes}</span> : null}
      {resource.free_notes && resource.cost !== 'free' ? <span className="muted" style={{ display: 'block', fontSize: 14, marginTop: 2 }}>{resource.free_notes}</span> : null}
    </li>
  );
}

export const STATUS_TEXT: Record<Status, string> = {
  locked: 'Not open yet',
  available: 'Open',
  active: 'In progress',
  'first-pass': 'Checks met once',
  passed: 'Done',
};

export function StatusMark({ status }: { status: Status }) {
  return <span className={`mark ${status}`} role="img" aria-label={STATUS_TEXT[status]} />;
}

export function moduleResources(course: Course, module: Module): { entry: ModuleResource; resource: Resource }[] {
  const rank = { core: 0, alternative: 1, supplementary: 2 } as const;
  return module.resources
    .map((entry) => ({ entry, resource: course.resource.get(entry.rid) }))
    .filter((item): item is { entry: ModuleResource; resource: Resource } => Boolean(item.resource))
    .sort((a, b) => rank[a.entry.role] - rank[b.entry.role]);
}

// An object URL for a stored photo, released when the component goes away.
export function useBlobUrl(blob: Blob | null | undefined): string | null {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}

export function formatDate(iso: string, withDay = true): string {
  const date = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return date.toLocaleDateString('en-AU', { weekday: withDay ? 'long' : undefined, day: 'numeric', month: 'long' });
}

export function minutesText(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function useNow(intervalMs = 60000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
}

export function roman(value: number): string {
  const table: [number, string][] = [[10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']];
  let left = value;
  let out = '';
  for (const [size, numeral] of table) while (left >= size) { out += numeral; left -= size; }
  return out;
}
