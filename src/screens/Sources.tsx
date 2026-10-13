import { useApp } from '../app/state';
import { href } from '../app/state';
import { Labels } from '../components/bits';

// Who the teaching comes from, what is known about each link, and what is still missing.
// Honest and plain on purpose.
export function Sources() {
  const { course } = useApp();
  const { resources, meta } = course.data;
  const used = new Map<string, string[]>();
  for (const module of course.order) for (const entry of module.resources) used.set(entry.rid, [...(used.get(entry.rid) || []), module.id]);
  const providers = new Map<string, number>();
  for (const resource of resources) if (used.has(resource.id)) providers.set(resource.provider, (providers.get(resource.provider) || 0) + 1);
  const problems = resources.filter((resource) => used.has(resource.id) && (['dead', 'unreachable', 'error'].includes(resource.link_status || '')));
  const unverified = resources.filter((resource) => used.has(resource.id) && !resource.verified);

  return (
    <article className="page stack gap-40" aria-labelledby="sources-title">
      <header className="stack gap-14">
        <span className="sc">Sources and gaps</span>
        <h1 id="sources-title" className="disp chapter-title">Where the teaching comes from</h1>
        <p className="lede">
          Delineare points to {used.size} free and part-free lessons from {providers.size} teachers, schools and museums, and credits each one.
          {` ${unverified.length} of them have not been opened by anyone checking this list, and say so wherever they appear.`}
        </p>
        {meta.research ? <p className="caption">{meta.research}</p> : null}
      </header>

      <section className="stack gap-10">
        <h2 className="section-title">Known gaps</h2>
        <ul className="read" style={{ margin: 0, paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 17, lineHeight: 1.5 }}>
          {meta.known_gaps.map((gap) => <li key={gap}>{gap}</li>)}
        </ul>
      </section>

      {problems.length ? (
        <section className="stack gap-10">
          <h2 className="section-title">Links that failed the last check</h2>
          <ul className="footnotes" style={{ listStyle: 'none', paddingLeft: 0 }}>
            {problems.map((resource) => (
              <li key={resource.id} className="rule-top">
                <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}</a>. {resource.provider}. <Labels resource={resource} />
                {resource.link_note ? <span className="muted" style={{ display: 'block', fontSize: 14 }}>{resource.link_note}</span> : null}
                <span className="muted" style={{ display: 'block', fontSize: 14 }}>Used in {used.get(resource.id)!.map((id) => course.module.get(id)?.title).join(', ')}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="stack gap-10">
        <h2 className="section-title">Teachers and institutions</h2>
        <ul className="read" style={{ margin: 0, padding: 0, listStyle: 'none', columns: '260px 3', columnGap: 32, fontSize: 16 }}>
          {[...providers.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, count]) => (
            <li key={name} style={{ breakInside: 'avoid', padding: '3px 0' }}>{name} <span className="mono muted" style={{ fontSize: 12 }}>{count}</span></li>
          ))}
        </ul>
      </section>

      <section className="stack gap-10">
        <h2 className="section-title">Reference images</h2>
        <p className="read" style={{ fontSize: 17, lineHeight: 1.55, maxWidth: '68ch' }}>
          Reference images come from the open-access collections of the Art Institute of Chicago, the Cleveland Museum of Art and the
          Metropolitan Museum of Art, and only from works each museum marks as public domain (CC0). The viewer names the artist, title,
          date and museum on every image. The egg and box renders are drawn for Delineare and free to use. Photos of your own pages
          stay on this computer. See also the <a href={href({ page: 'library' })}>library</a>.
        </p>
      </section>
    </article>
  );
}
