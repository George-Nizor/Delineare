import { Fragment, type ReactNode } from 'react';
import type { Inline } from '../content/types';

// Renders lesson prose from the small tree the content build writes, so no HTML from content is
// ever inserted into the page. Links open in the system browser (the launcher sends them there).
export function InlineText({ nodes }: { nodes: Inline }): ReactNode {
  return nodes.map((node, index) => {
    switch (node.t) {
      case 'text': return <Fragment key={index}>{node.v}</Fragment>;
      case 'code': return <code key={index}>{node.v}</code>;
      case 'strong': return <strong key={index}><InlineText nodes={node.c} /></strong>;
      case 'em': return <em key={index}><InlineText nodes={node.c} /></em>;
      case 'link': return <a key={index} href={node.href} target="_blank" rel="noreferrer"><InlineText nodes={node.c} /></a>;
      default: return null;
    }
  });
}

export function Paragraphs({ items, className }: { items: Inline[]; className?: string }): ReactNode {
  return items.map((nodes, index) => <p key={index} className={className}><InlineText nodes={nodes} /></p>);
}
