// Eyes on the edge: the eye travels slowly along the edge and the pen moves at the same speed.
import { observedLeaf } from './shared.mjs';

export default ({ svg, rect, smooth, dot, text }) => {
  const leaf = observedLeaf(96, 120, 170, { turn: -18 });
  const seen = leaf.outline.slice(14, 44);
  const drawn = observedLeaf(266, 120, 170, { turn: -18 }).outline.slice(14, 44).map(([x, y], i) => [x + Math.sin(i / 3) * 1.6, y + i * 0.25]);
  const end = seen[seen.length - 1];
  return svg({ width: 360, height: 240 },
    rect(20, 20, 150, 200, { rx: 3, cls: 'd-sunk' }),
    smooth(leaf.outline, { cls: 'd-guide', width: 1.8 }),
    smooth(seen, { cls: 'd-mark', width: 3.2 }),
    dot(end[0], end[1], { r: 5, cls: 'd-mark-fill' }),
    text(95, 212, 'eyes along the edge', { anchor: 'middle', size: 12 }),
    rect(190, 20, 150, 200, { rx: 3 }),
    smooth(drawn, { width: 2 }),
    text(265, 212, 'the pen keeps pace', { anchor: 'middle', size: 12 }),
  );
};
