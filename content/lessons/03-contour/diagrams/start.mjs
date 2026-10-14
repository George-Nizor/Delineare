// Pick a starting point: eyes on a point of the object's edge, pen on the paper, ready to move.
import { observedLeaf } from './shared.mjs';

export default ({ svg, rect, smooth, dot, text, arcArrow }) => {
  const leaf = observedLeaf(96, 120, 170, { turn: -18 });
  const start = leaf.outline[14];
  return svg({ width: 360, height: 240 },
    rect(20, 20, 150, 200, { rx: 3, cls: 'd-sunk' }),
    smooth(leaf.outline, { cls: 'd-guide', width: 1.8 }),
    dot(start[0], start[1], { r: 5, cls: 'd-mark-fill' }),
    text(95, 212, 'the object', { anchor: 'middle', size: 13 }),
    rect(190, 20, 150, 200, { rx: 3 }),
    dot(250, 96, { r: 3 }),
    text(265, 212, 'the paper', { anchor: 'middle', size: 13 }),
    arcArrow(start[0] + 8, start[1] - 6, 244, 92, { lift: -26, dash: '5 5' }),
  );
};
