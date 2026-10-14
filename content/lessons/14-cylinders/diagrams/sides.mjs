// Step four: the sides run from ellipse to ellipse. They are not parallel on the page: extended,
// they and the axis head for one vanishing point.
import { std, along, hand, toward } from './cyl.js';

export default (kit) => {
  const { cyl: c } = std();
  const a = along(c.p0, c.p1, -0.45);
  const b = along(c.p0, c.p1, 1.45);
  const reach = (p) => {
    // Stop the dashed extension at the frame's right edge.
    const dx = c.vp[0] - p[0];
    return Math.min(0.5, (500 - p[0]) / dx);
  };
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }),
    kit.line(a[0], a[1], b[0], b[1], { cls: 'd-mark', width: 1.5 }),
    hand(kit, c.ends[0], 5), hand(kit, c.ends[1], 9),
    c.sides.map(([p, q]) => [kit.line(p[0], p[1], q[0], q[1], { width: 2.4 }), toward(kit, q, c.vp, reach(q), { cls: 'd-guide', width: 1.4, dash: '5 6' })]),
    toward(kit, b, c.vp, reach(b) * 0.95, { cls: 'd-guide', width: 1.4, dash: '5 6' }),
    kit.text(508, 330, 'toward one vanishing point, off the page', { anchor: 'end', size: 13 }),
  );
};
