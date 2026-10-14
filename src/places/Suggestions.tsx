import { useContent } from '../content/load';
import { KIND_LABEL } from '../content/types';
import type { Suggestion } from '../engine/review';
import { href } from '../router';

const ROLE: Record<Suggestion['role'], string> = {
  continue: 'From the lesson you are on',
  review: 'Review',
  'warm-up': 'Warm-up',
  free: 'Draw for its own sake',
};

export function Suggestions({ items, seed, onAnother }: { items: Suggestion[]; seed: number; onAnother: () => void }) {
  const content = useContent();
  return (
    <ul className="suggestions">
      {items.map((suggestion) => {
        if (suggestion.role === 'free') {
          return (
            <li key="free" className="suggestion">
              <a className="suggestion-link" href={href('free', seed)}>
                <span className="eyebrow">{ROLE.free}</span>
                <span className="suggestion-title">{suggestion.prompt}</span>
                <span className="meta">10 min · Imagination</span>
              </a>
              <button type="button" className="quiet suggestion-another" onClick={onAnother}>Another prompt</button>
            </li>
          );
        }
        const item = content.practice[suggestion.practiceId ?? ''];
        if (!item) return null;
        const lesson = content.lessons[item.lesson];
        return (
          <li key={item.id} className="suggestion">
            <a className="suggestion-link" href={href('do', item.id)}>
              <span className="eyebrow">{ROLE[suggestion.role]}</span>
              <span className="suggestion-title">{item.title}</span>
              <span className="meta">{item.minutes} min · {KIND_LABEL[item.kind]}{lesson ? ` · Lesson ${lesson.number}` : ''}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
