// A finished construction: the mug as boxes and cylinders would build it, every form drawn through,
// the joins marked, the line weight added only where lines cross.
import { mug, parts, halves } from './mug.js';

export default (kit) => {
  const m = mug();
  const p = parts(kit, m, { through: true, width: 2 });
  // A heavier stroke only where the handle crosses the body's edge.
  const heavy = m.end.map((e) => kit.circle(e[0], e[1], 5, { width: 3.4 }));
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }), p.axis, p.body, p.handle, p.joins, kit.smooth(m.rimInner, { width: 2, closed: true }), p.foot);
};
