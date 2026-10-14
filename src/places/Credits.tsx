import { useContent } from '../content/load';

export function Credits() {
  const content = useContent();
  const byTeacher = new Map<string, typeof content.resources[string][]>();
  for (const resource of Object.values(content.resources)) {
    byTeacher.set(resource.teacher, [...(byTeacher.get(resource.teacher) ?? []), resource]);
  }
  return (
    <div className="page credits narrow">
      <header className="page-head">
        <h1>Teachers and credits</h1>
        <p className="lede">Delineare links to these teachers' own lessons and never copies them. A lesson that uses a teacher's method names them.</p>
      </header>
      <ul className="credit-list">
        {[...byTeacher.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([teacher, resources]) => (
          <li key={teacher}>
            <h2>{teacher}</h2>
            <ul>
              {resources.map((resource) => (
                <li key={resource.id}><a href={resource.url} target="_blank" rel="noreferrer">{resource.title}</a> <span className="meta">· {resource.kind}</span></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <section>
        <h2>Drawings on the course page</h2>
        <p>The drawings on the lesson cards are from the Art Institute of Chicago's open access collection and are in the public domain. Each card names the artist, the title and the date.</p>
      </section>
      <section>
        <h2>Type and mark</h2>
        <p>Fraunces by Undercase Type, Commissioner by Kostas Bartsokas, and Spline Sans Mono by Eben Sorkin and Mirko Velimirovic, all under the SIL Open Font License. The pencil mark is part of the Instrumenta suite.</p>
      </section>
    </div>
  );
}
