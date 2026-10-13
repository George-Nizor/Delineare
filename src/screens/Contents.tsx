import { useState } from 'react';
import { go, href, useApp } from '../app/state';
import { hoursText, ROMAN } from '../data/load';
import type { Module, Tier } from '../data/types';
import { StatusMark, STATUS_TEXT } from '../components/bits';
import { statusOf, type Status } from '../engine/plan';

type Filter = 'spine' | 'all' | 'play';

// The path, set as a book's contents: each phase a part, each module a chapter with its estimated
// hours on the right. A mark says where each chapter stands; words in the legend say what each
// mark means. The real total is stated once, without softening.
export function Contents() {
  const { course, progress } = useApp();
  const [filter, setFilter] = useState<Filter>('spine');
  const [tier, setTier] = useState<Tier | 'any'>('any');
  const shown = (module: Module) => (filter === 'spine' ? module.spine : filter === 'play' ? module.track === 'play' : true)
    && (tier === 'any' || module.tier === tier);
  const meta = course.data.meta;
  const playable = course.order.filter((module) => module.track === 'play' && statusOf(module, progress) !== 'locked');

  const surprise = () => {
    const pick = playable[Math.floor(Math.random() * playable.length)];
    if (pick) go({ page: 'session', mode: 'practice', moduleId: pick.id });
  };

  return (
    <article className="page stack gap-28" aria-labelledby="contents-title">
      <header className="row">
        <div className="stack gap-14">
          <span className="sc">Contents</span>
          <h1 id="contents-title" className="disp chapter-title">The path</h1>
          <p className="lede">
            {meta.module_count} chapters in {course.data.phases.length} parts. The spine is about {hoursText(meta.hours_spine)} of study,
            and everything together about {hoursText(meta.hours_all)}, plus ongoing practice. These are estimates, not measurements.
          </p>
        </div>
        <div className="stack gap-10" style={{ alignSelf: 'end' }}>
          <div className="segmented" role="group" aria-label="Show">
            {(['spine', 'all', 'play'] as Filter[]).map((value) => (
              <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>
                {value === 'spine' ? 'Spine' : value === 'all' ? 'Everything' : 'Play'}
              </button>
            ))}
          </div>
          <label className="inline" style={{ gap: 8, fontSize: 14 }}>
            Tier
            <select value={tier} onChange={(event) => setTier(event.target.value as Tier | 'any')}>
              <option value="any">Any</option>
              <option value="essential">Essential</option>
              <option value="deepening">Deepening</option>
              <option value="stretch">Stretch</option>
              <option value="optional">Optional</option>
            </select>
          </label>
          <button type="button" className="ghost" onClick={surprise} disabled={!playable.length}>Surprise me</button>
        </div>
      </header>

      <div className="legend" aria-label="What the marks mean">
        {(['passed', 'first-pass', 'active', 'available', 'locked'] as Status[]).map((status) => (
          <span key={status}><StatusMark status={status} />{STATUS_TEXT[status]}</span>
        ))}
      </div>

      <div className="contents">
        {[...course.data.phases].sort((a, b) => a.number - b.number).map((phase) => {
          const modules = phase.module_ids.map((id) => course.module.get(id)).filter((module): module is Module => Boolean(module) && shown(module!));
          if (!modules.length) return null;
          return (
            <section key={phase.number} className="chapter-group" aria-labelledby={`part-${phase.number}`}>
              <h2 id={`part-${phase.number}`} className="section-title">
                <span className="read italic" style={{ fontWeight: 500, minWidth: 44 }}>{ROMAN[phase.number]}.</span>
                {phase.title}
              </h2>
              <p className="caption" style={{ marginLeft: 58, maxWidth: '70ch' }}>{phase.summary}</p>
              <ol className="toc">
                {modules.map((module) => {
                  const status = statusOf(module, progress);
                  const missing = module.prerequisites.filter((id) => !progress.get(id)?.firstPass).map((id) => course.module.get(id)?.title).filter(Boolean);
                  return (
                    <li key={module.id} className={status === 'locked' ? 'locked' : undefined}>
                      <StatusMark status={status} />
                      <span className="stack">
                        <a href={href({ page: 'module', id: module.id })}>
                          <span className="mono muted" style={{ fontSize: 12, marginRight: 10 }}>{course.chapter.get(module.id)}</span>
                          {module.title}
                        </a>
                        {status === 'locked' && missing.length ? <span className="muted" style={{ fontSize: 13 }}>After {shortTitle(missing[0]!)}{missing.length > 1 ? ` and ${missing.length - 1} more` : ''}</span> : null}
                      </span>
                      <span className="leader" aria-hidden="true" />
                      <span className="hours">
                        {module.ongoing ? 'ongoing, ' : ''}{hoursText(module.est_hours)}
                        {module.free_coverage === 'thin' ? ' · thin free cover' : ''}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </article>
  );
}

// Chapter titles carry a subtitle after the colon; the short form is enough in a reminder.
function shortTitle(title: string): string {
  return title.split(':')[0]!.trim();
}
