import { useState } from 'react';
import { practiceByLesson, useContent, writtenLessons } from '../content/load';
import { drawingFor, iconFor } from '../content/art';
import { KIND_LABEL, type PracticeItem, type PracticeKind } from '../content/types';
import { daySeed, makePrompt } from '../engine/prompts';
import { suggest } from '../engine/review';
import { href } from '../router';
import { useAppData } from '../store/appData';
import { Icon } from '../ui/Icons';
import { ago, lastDone } from '../ui/time';
import { Suggestions } from './Suggestions';

const LENGTHS = [
  { value: 0, label: 'Any length', fits: () => true },
  { value: 5, label: 'Up to 5 min', fits: (m: number) => m <= 5 },
  { value: 10, label: 'Up to 10 min', fits: (m: number) => m <= 10 },
  { value: 20, label: 'Up to 20 min', fits: (m: number) => m <= 20 },
  { value: 30, label: '30 min or more', fits: (m: number) => m >= 30 },
] as const;

type Sort = 'course' | 'short' | 'long' | 'stale';

export function Practice() {
  const content = useContent();
  const { records, log } = useAppData();
  const [offset, setOffset] = useState(0);
  const [query, setQuery] = useState('');
  const [part, setPart] = useState(0);
  const [length, setLength] = useState(0);
  const [kind, setKind] = useState<PracticeKind | ''>('');
  const [sort, setSort] = useState<Sort>('course');

  const written = writtenLessons(content);
  const now = Date.now();
  const seed = daySeed(now) + offset;
  const suggestions = suggest({ order: written.map((l) => l.slug), records, practice: practiceByLesson(content), log, now, prompt: makePrompt(content.prompts, seed) });
  const last = lastDone(log);

  const all = written.flatMap((lesson) => lesson.practice.map((id) => content.practice[id]!));
  const lessonOf = (item: PracticeItem) => content.lessons[item.lesson]!;
  const q = query.trim().toLowerCase();
  const lengthFits = (item: PracticeItem, value: number) => LENGTHS.find((l) => l.value === value)!.fits(item.minutes);
  const matches = (item: PracticeItem, skip?: 'part' | 'length' | 'kind') =>
    (!q || `${item.title} ${KIND_LABEL[item.kind]} ${lessonOf(item).title}`.toLowerCase().includes(q))
    && (skip === 'part' || !part || lessonOf(item).part === part)
    && (skip === 'length' || lengthFits(item, length))
    && (skip === 'kind' || !kind || item.kind === kind);
  const order = new Map(all.map((item, i) => [item.id, i]));
  const sorters: Record<Sort, (a: PracticeItem, b: PracticeItem) => number> = {
    course: (a, b) => order.get(a.id)! - order.get(b.id)!,
    short: (a, b) => a.minutes - b.minutes || order.get(a.id)! - order.get(b.id)!,
    long: (a, b) => b.minutes - a.minutes || order.get(a.id)! - order.get(b.id)!,
    stale: (a, b) => (last.get(a.id) ?? 0) - (last.get(b.id) ?? 0) || order.get(a.id)! - order.get(b.id)!,
  };
  const items = all.filter((item) => matches(item)).sort(sorters[sort]);
  const filtered = Boolean(q) || part !== 0 || length !== 0 || kind !== '';
  const kinds = [...new Set(all.map((item) => item.kind))];
  const count = (skip: 'part' | 'length' | 'kind', test: (item: PracticeItem) => boolean) => all.filter((item) => matches(item, skip) && test(item)).length;
  const clear = () => { setQuery(''); setPart(0); setLength(0); setKind(''); };

  return (
    <div className="page practice">
      <header className="page-head">
        <h1>Practice</h1>
        <p className="lede">Exercises from every lesson, plus timed pose sessions and drawing prompts. Nothing here has a schedule, so pick whatever suits the time you have.</p>
      </header>

      <section aria-labelledby="suggested-title">
        <h2 id="suggested-title">Suggested now</h2>
        <Suggestions items={suggestions} seed={seed} onAnother={() => setOffset((value) => value + 1)} />
      </section>

      <section className="library-layout" aria-labelledby="all-title">
        <aside className="filters" aria-label="Filters">
          <label className="field search-field">
            <Icon name="search" size={16} />
            <span className="visually-hidden">Search exercises</span>
            <input type="search" placeholder="Search exercises" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <FilterGroup name="Part" value={part} onPick={setPart} options={[
            { value: 0, label: 'Any part' },
            ...content.parts.map((p) => ({ value: p.number, label: p.title, count: count('part', (item) => lessonOf(item).part === p.number) })),
          ]} />
          <FilterGroup name="Length" value={length} onPick={setLength} options={LENGTHS.map((l) => ({ value: l.value, label: l.label, count: l.value ? count('length', (item) => lengthFits(item, l.value)) : undefined }))} />
          <FilterGroup name="Type" value={kind} onPick={setKind} options={[
            { value: '' as const, label: 'Any type' },
            ...kinds.map((k) => ({ value: k, label: KIND_LABEL[k], count: count('kind', (item) => item.kind === k) })),
          ]} />
        </aside>

        <div className="results">
          <div className="results-head">
            <h2 id="all-title">{filtered ? `Showing ${items.length} of ${all.length} exercises` : `All ${all.length} exercises`}
              {filtered ? <button type="button" className="quiet clear" onClick={clear}>Clear filters</button> : null}
            </h2>
            <label className="sort">Order
              <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
                <option value="course">Course order</option>
                <option value="short">Shortest first</option>
                <option value="long">Longest first</option>
                <option value="stale">Done longest ago</option>
              </select>
            </label>
          </div>
          {items.length ? (
            <ul className="rows big-rows">
              {items.map((item) => {
                const lesson = lessonOf(item);
                const when = last.get(item.id);
                return (
                  <li key={item.id}>
                    <a className="row" href={href('do', item.id)}>
                      <span className="row-art"><img src={drawingFor(lesson.slug)?.src ?? iconFor(lesson.number)} alt="" /></span>
                      <span className="row-body">
                        <span className="row-title">{item.title}</span>
                        <span className="meta">Lesson {lesson.number}: {lesson.title}{item.main ? ', the lesson exercise' : ''} · {when ? `last done ${ago(when)}` : 'not done yet'}</span>
                      </span>
                      <span className="row-side">
                        <span className="mins">{item.minutes} min</span>
                        <span className="meta">{KIND_LABEL[item.kind]}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="empty">Nothing matches all of those. Change a filter or <button type="button" className="quiet" onClick={clear}>clear them</button>.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterGroup<T extends string | number>({ name, value, onPick, options }: { name: string; value: T; onPick: (value: T) => void; options: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="filter-group" role="group" aria-label={name}>
      <h3>{name}</h3>
      {options.map((option) => (
        <button key={String(option.value)} type="button" className="filter-option" aria-pressed={value === option.value} disabled={option.count === 0 && value !== option.value} onClick={() => onPick(option.value)}>
          <span>{option.label}</span>
          {option.count !== undefined ? <span className="count">{option.count}</span> : null}
        </button>
      ))}
    </div>
  );
}
