// Step one: vanishing points marked on the page, a set of three for each box, each set with its own
// symbol (an O for one box, an @ for the next, a # for the third). Every set is where a camera tipped
// down at a box would put its points: two on a horizon and one below it.
import { camera, box } from '../../12-plotted-boxes/diagrams/geom.js';

const SETS = [
  { symbol: 'O', f: 150, pitch: 0.7, yaw: 0.9, top: 44, cx: 300 },
  { symbol: '@', f: 110, pitch: 0.75, yaw: 1.0, top: 84, cx: 340 },
  { symbol: '#', f: 80, pitch: 0.6, yaw: 0.7, top: 150, cx: 190 },
];

export default (kit) => {
  const mark = (symbol, p) => (symbol === 'O'
    ? kit.circle(p[0], p[1], 8, { width: 2.2 })
    : kit.text(p[0], p[1] + 7, symbol, { cls: 'd-label', anchor: 'middle', size: 24 }));
  const sets = SETS.map(({ symbol, f, pitch, yaw, top, cx }) => {
    const cy = top - camera({ f, cx: 0, cy: 0, pitch }).horizonY;
    const cam = camera({ f, cx, cy, pitch });
    const b = box(cam, { at: [0, -4, 3], w: 3, h: 3, d: 3, yaw });
    return { symbol, pts: [cam.vp(b.dirs.u), cam.vp(b.dirs.v), cam.vp(b.dirs.up)] };
  });
  return kit.svg({ width: 540, height: 360 },
    kit.rect(16, 8, 508, 344, { rx: 4 }),
    sets.map(({ symbol, pts }) => pts.map((p) => mark(symbol, p))),
  );
};
