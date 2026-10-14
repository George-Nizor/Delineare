import { useState } from 'react';
import type { Resource } from '../content/types';

// One line per resource: title, teacher, what it is, length and cost. A YouTube lesson can play in
// place, in YouTube's privacy-enhanced player; everything opens in the system browser too.
export function ResourceLine({ resource }: { resource: Resource }) {
  const [playing, setPlaying] = useState(false);
  const details = [resource.kind + (resource.minutes ? `, ${resource.minutes} min` : ''), resource.cost].join(' · ');
  return (
    <li className="resource">
      <div className="resource-line">
        <span className="resource-text">
          <span className="resource-title">{resource.title}</span>
          <span className="meta"> · {resource.teacher} · {details}</span>
        </span>
        <span className="resource-actions">
          {resource.youtube ? (
            <button type="button" className="quiet" aria-expanded={playing} onClick={() => setPlaying((value) => !value)}>
              {playing ? 'Close the video' : 'Play here'}
            </button>
          ) : null}
          <a className="quiet" href={resource.url} target="_blank" rel="noreferrer">Open</a>
        </span>
      </div>
      {playing && resource.youtube ? <VideoEmbed id={resource.youtube} title={`${resource.title}, ${resource.teacher}`} /> : null}
    </li>
  );
}

// Delineare's page is cross-origin isolated, so the player loads as a credentialless frame: no
// cookies go to YouTube, and the launcher allows this one embed origin and nothing else.
export function VideoEmbed({ id, title }: { id: string; title: string }) {
  const frameAttributes = { credentialless: '' } as Record<string, string>;
  return (
    <div className="video">
      <iframe
        {...frameAttributes}
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
        title={title}
        allow="fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
    </div>
  );
}
