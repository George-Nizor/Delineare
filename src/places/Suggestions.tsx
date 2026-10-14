import { useContent } from '../content/load';
import { KIND_LABEL } from '../content/types';
import type { Suggestion } from '../engine/review';
import { href } from '../router';
import { useAppData } from '../store/appData';
import { ago, lastDone } from '../ui/time';

// Up to three things to draw now: the next exercise in the course, something to review, a warm-up,
// and a drawing prompt.
export function Suggestions({ items, seed, onAnother }: { items: Suggestion[]; seed: number; onAnother: () => void }) {
  const content = useContent();
  const { log } = useAppData();
  const last = lastDone(log);
  return (
    <ul className="cards suggestions stagger">
      {items.map((suggestion) => {
        if (suggestion.role === 'free') {
          return (
            <li key="free" className="card suggestion dark">
              <a className="card-link" href={href('free', seed)}>
                <span className="card-title">Today's drawing prompt</span>
                <span className="card-text prompt-text">{suggestion.prompt}</span>
                <span className="card-meta">Imagination · 10 min</span>
              </a>
              <button type="button" className="quiet another" onClick={onAnother}>Another prompt</button>
            </li>
          );
        }
        const item = content.practice[suggestion.practiceId ?? ''];
        if (!item) return null;
        const lesson = content.lessons[item.lesson];
        const when = last.get(item.id);
        const why = suggestion.role === 'continue'
          ? `From lesson ${lesson?.number}, the one you're on`
          : `Lesson ${lesson?.number}${when ? `, last done ${ago(when)}` : ''}`;
        return (
          <li key={item.id} className="card suggestion">
            <a className="card-link" href={href('do', item.id)}>
              <span className="card-title">{item.title}</span>
              <span className="card-text">{KIND_LABEL[item.kind]} · {item.minutes} min</span>
              <span className="card-meta">{why}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
