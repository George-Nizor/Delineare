import { href } from '../app/state';
import { isTool, TOOLS, ToolView } from '../tools/ToolView';

// A tool on its own page, for drawing from it outside a session.
export function ToolPage({ name }: { name: string }) {
  const tool = TOOLS.find((entry) => entry.id === name);
  if (!tool || !isTool(name)) {
    return <article className="page"><h1 className="section-title">No such tool</h1><a href={href({ page: 'library' })}>Back to the library</a></article>;
  }
  return (
    <article className="page wide stack gap-20 tool-page" aria-labelledby="tool-title">
      <header className="stack gap-10">
        <span className="sc">Tool</span>
        <h1 id="tool-title" className="disp chapter-title" style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>{tool.title}</h1>
        <p className="lede">{tool.summary} Drag to look around.</p>
      </header>
      <ToolView tool={name} />
    </article>
  );
}
