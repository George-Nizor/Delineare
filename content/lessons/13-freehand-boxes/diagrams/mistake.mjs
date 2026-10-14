// The usual mistake: nudging the back corner until it looks right. The corner is a symptom; the sets
// of edges are what to check. Left, edges that wander, with the back corner ringed. Right, edges that
// head for their points.
import { handBox, drawHandBox, placed } from './sketch.js';
import { depth } from './scene.js';

export default (kit) => {
  const panel = (x, bad) => {
    const s = handBox({}, bad ? { slop: 7, seed: 5 } : { slop: 0.7, seed: 2 });
    const far = s.drawn.map((_, i) => i).sort((a, b) => depth(s, b) - depth(s, a))[0];
    const art = [drawHandBox(kit, s, { width: 4, reach: 0.97 }), bad ? kit.circle(s.drawn[far][0], s.drawn[far][1], 17, { cls: 'd-bad', width: 4 }) : ''];
    const sc = 0.46;
    return `<g transform="translate(${(x + 10 - 20 * sc).toFixed(2)} ${(70 - 26 * sc).toFixed(2)}) scale(${sc})">${art.flat(Infinity).join('')}</g>`;
  };
  return kit.svg({ width: 560, height: 290 },
    kit.rect(16, 16, 256, 258, { rx: 3 }), kit.tag(144, 44, 'Fixing the back corner', { tone: 'bad' }), panel(16, true),
    kit.rect(288, 16, 256, 258, { rx: 3 }), kit.tag(416, 44, 'Checking the edges', { tone: 'mark' }), panel(288, false),
  );
};
