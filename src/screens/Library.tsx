import { useState } from 'react';
import { href, useApp } from '../app/state';
import { TOOLS } from '../tools/ToolView';
import { ROMAN } from '../data/load';
import type { LibraryEntry } from '../data/types';

const TYPE_TITLE: Record<string, string> = {
  'timed-reference': 'Timed pose and gesture sessions',
  'photo-bank': 'Photo banks',
  'museum-open-access': 'Museum open-access collections',
  worksheet: 'Worksheets and grids',
  'prompt-list': 'Prompts for invention',
  software: 'Software',
  community: 'Places to get critique',
  'learning-science': 'How practice works',
};

// Practice material by kind, each with its licence in its owner's terms. Links open in the
// browser; nothing here is copied into Delineare.
export function Library() {
  const { course } = useApp();
  const [phase, setPhase] = useState(0);
  const entries = course.data.library.filter((entry) => !phase || !entry.use_for_phases || entry.use_for_phases.includes(phase));
  const groups = new Map<string, LibraryEntry[]>();
  for (const entry of entries) groups.set(entry.type, [...(groups.get(entry.type) || []), entry]);

  return (
    <article className="page stack gap-28" aria-labelledby="library-title">
      <header className="row">
        <div className="stack gap-14">
          <span className="sc">Library</span>
          <h1 id="library-title" className="disp chapter-title">Material to practise from</h1>
          <p className="lede">Pose sites, image collections, worksheets, prompts and tools. Each keeps its owner's licence, shown in their words.</p>
        </div>
        <label className="stack gap-6" style={{ alignSelf: 'end', fontSize: 14 }}>
          Useful for part
          <select value={phase} onChange={(event) => setPhase(Number(event.target.value))}>
            <option value={0}>Any part</option>
            {course.data.phases.map((entry) => <option key={entry.number} value={entry.number}>{ROMAN[entry.number]}. {entry.title}</option>)}
          </select>
        </label>
      </header>
      <section className="stack gap-10" aria-labelledby="lib-tools">
        <h2 id="lib-tools" className="section-title">Tools in Delineare</h2>
        <ul className="footnotes" style={{ listStyle: 'none', paddingLeft: 0 }}>
          {TOOLS.map((tool) => (
            <li key={tool.id} className="rule-top">
              <a href={href({ page: 'tool', name: tool.id })} style={{ fontSize: 18 }}>{tool.title}</a>
              <span style={{ display: 'block' }}>{tool.summary}</span>
              <span className="muted" style={{ display: 'block', fontSize: 14 }}>Generated here. Anything it renders is yours to draw from.</span>
            </li>
          ))}
        </ul>
      </section>
      {[...groups.entries()].map(([type, items]) => (
        <section key={type} className="stack gap-10" aria-labelledby={`lib-${type}`}>
          <h2 id={`lib-${type}`} className="section-title">{TYPE_TITLE[type] || type}</h2>
          <ul className="footnotes" style={{ listStyle: 'none', paddingLeft: 0 }}>
            {items.map((entry) => (
              <li key={entry.url + entry.title} className="rule-top">
                <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 18 }}>{entry.title}</a>
                {entry.provider && entry.provider !== entry.title ? <span className="muted">. {entry.provider}</span> : null}
                {entry.notes ? <span style={{ display: 'block' }}>{entry.notes}</span> : null}
                <span className="muted" style={{ display: 'block', fontSize: 14 }}>Licence: {entry.licence}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
