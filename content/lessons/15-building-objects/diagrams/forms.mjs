// Name its forms: the mug is a cylinder and a curved band, and the band meets the cylinder at two
// places.
import { mug, parts } from './mug.js';

export default (kit) => {
  const m = mug();
  const p = parts(kit, m, { through: false, width: 2.2 });
  const c = m.cyl;
  const o = m.outer.reduce((best, q) => (q[0] > best[0] ? q : best), m.outer[0]);
  const left = c.sides.map(([p, q]) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]).sort((u, v) => u[0] - v[0])[0];
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }), p.body, p.handle,
    kit.text(40, left[1] + 8, 'cylinder', { size: 14, cls: 'd-tag' }), kit.line(104, left[1] + 4, left[0] - 4, left[1], { cls: 'd-mark', width: 1.4 }),
    kit.text(508, o[1] - 82, 'curved band', { size: 14, cls: 'd-tag', anchor: 'end' }), kit.line(o[0] + 6, o[1] - 74, o[0], o[1] - 4, { cls: 'd-mark', width: 1.4 }),
  );
};
