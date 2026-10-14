import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Resource } from '../content/types';
import { Icon } from './Icons';

// One line per resource: title, teacher, what it is, length and cost. A YouTube lesson can play in
// place, in YouTube's privacy-enhanced player; everything opens in the system browser too.
export function ResourceLine({ resource, extra }: { resource: Resource; extra?: ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const details = [resource.teacher, resource.kind + (resource.minutes ? `, ${resource.minutes} min` : ''), resource.cost].join(' · ');
  return (
    <li className={`resource ${playing ? 'playing' : ''}`}>
      <div className="resource-line">
        <span className="resource-text">
          <span className="resource-title">{resource.title}</span>
          <span className="meta">{details}</span>
          {extra}
        </span>
        <span className="resource-actions">
          {resource.youtube ? (
            <button type="button" className="button small" aria-expanded={playing} onClick={() => setPlaying((value) => !value)}>
              {playing ? 'Close' : <><Icon name="play" size={14} />Play here</>}
            </button>
          ) : null}
          <a className="button small ghost" href={resource.url} target="_blank" rel="noreferrer"><Icon name="open" size={14} />Open</a>
        </span>
      </div>
      {playing && resource.youtube ? <VideoEmbed id={resource.youtube} title={`${resource.title}, ${resource.teacher}`} /> : null}
    </li>
  );
}

// Delineare's page is cross-origin isolated, so the player must load as a credentialless frame: no
// cookies go to YouTube, and the launcher allows this one embed origin and nothing else. React drops
// a bare `credentialless` attribute, so the frame gets it here, before its address, which is the
// order the browser needs: an attribute added after the frame starts loading has no effect.
export function VideoEmbed({ id, title }: { id: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    element.setAttribute('credentialless', '');
    element.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`;
  }, [id]);
  return (
    <div className={`video ${loaded ? 'loaded' : ''}`}>
      <iframe
        ref={frame}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
