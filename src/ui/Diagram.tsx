import type { Diagram } from '../content/types';

// A lesson diagram. The SVG markup is generated at build time by our own scripts in
// content/lessons/*/diagrams and checked to contain no scripts or event handlers.
export function DiagramView({ diagram, className = '' }: { diagram: Diagram | undefined; className?: string }) {
  if (!diagram) return null;
  return (
    <figure className={`diagram ${className}`}>
      <div className="diagram-art" role="img" aria-label={diagram.alt} dangerouslySetInnerHTML={{ __html: diagram.svg }} />
    </figure>
  );
}
