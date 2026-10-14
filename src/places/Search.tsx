import { useContent } from '../content/load';
import { KIND_LABEL } from '../content/types';
import { href } from '../router';
import { Icon } from '../ui/Icons';

// Results for the search box in the sidebar: lessons, exercises and library resources.
export function SearchPage({ query }: { query: string }) {
  const content = useContent();
  const q = query.trim().toLowerCase();
  const has = (text: string) => text.toLowerCase().includes(q);
  const lessons = content.parts.flatMap((part) => part.lessons).filter((entry) => has(`${entry.title} ${entry.summary}`));
  const exercises = Object.values(content.practice).filter((item) => has(`${item.title} ${KIND_LABEL[item.kind]}`));
  const resources = Object.values(content.resources).filter((r) => has(`${r.title} ${r.teacher}`));
  const total = lessons.length + exercises.length + resources.length;

  return (
    <div className="page search-page narrow">
      <header className="page-head">
        <h1>Search</h1>
        <p className="lede">{q ? `${total} result${total === 1 ? '' : 's'} for "${query.trim()}".` : 'Type in the search box to find a lesson, an exercise or a teacher.'}</p>
      </header>
      {lessons.length ? (
        <section aria-labelledby="r-lessons">
          <h2 id="r-lessons">Lessons</h2>
          <ul className="rows">
            {lessons.map((entry) => (
              <li key={entry.slug}><a className="row" href={href('lesson', entry.slug)}><span className="row-body"><span className="row-title">Lesson {entry.number}: {entry.title}</span><span className="meta">{entry.summary}</span></span><Icon name="next" size={18} /></a></li>
            ))}
          </ul>
        </section>
      ) : null}
      {exercises.length ? (
        <section aria-labelledby="r-exercises">
          <h2 id="r-exercises">Exercises</h2>
          <ul className="rows">
            {exercises.map((item) => (
              <li key={item.id}><a className="row" href={href('do', item.id)}><span className="row-body"><span className="row-title">{item.title}</span><span className="meta">{KIND_LABEL[item.kind]} · {item.minutes} min · lesson {content.lessons[item.lesson]?.number}</span></span><Icon name="next" size={18} /></a></li>
            ))}
          </ul>
        </section>
      ) : null}
      {resources.length ? (
        <section aria-labelledby="r-library">
          <h2 id="r-library">Library</h2>
          <ul className="rows">
            {resources.map((r) => (
              <li key={r.id}><a className="row" href={r.url} target="_blank" rel="noreferrer"><span className="row-body"><span className="row-title">{r.title}</span><span className="meta">{r.teacher} · {r.kind}</span></span><Icon name="open" size={18} /></a></li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
