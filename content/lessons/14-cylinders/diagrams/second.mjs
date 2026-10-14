// Step three: the second ellipse at the other end. The farther end is slightly rounder, wider
// across its narrow direction, than the nearer one.
import { std, along, hand } from './cyl.js';

export default (kit) => {
  const { cyl: c } = std();
  const a = along(c.p0, c.p1, -0.45);
  const b = along(c.p0, c.p1, 1.45);
  const far = c.ends[1];
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }),
    kit.line(a[0], a[1], b[0], b[1], { width: 2.2 }),
    hand(kit, c.ends[0], 5), hand(kit, c.ends[1], 9),
    kit.dot(a[0], a[1], { r: 3.4 }), kit.dot(b[0], b[1], { r: 3.4 }),
    kit.text(far.cx + far.rx * 0.5, far.cy - far.ry - 16, 'farther: a little rounder', { anchor: 'start', size: 13 }),
    kit.text(c.ends[0].cx - 10, c.ends[0].cy + c.ends[0].rx + 22, 'nearer: narrower', { anchor: 'middle', size: 13 }),
  );
};
