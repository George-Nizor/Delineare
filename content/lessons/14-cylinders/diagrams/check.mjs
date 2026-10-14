// Step five: check. In a second colour, find the line that really cuts each ellipse into two equal
// halves, and compare it with the axis you drew.
import { std, along, hand } from './cyl.js';

export default (kit) => {
  const { cyl: c } = std();
  const a = along(c.p0, c.p1, -0.2);
  const b = along(c.p0, c.p1, 1.25);
  // The nearer ellipse was drawn turned a few degrees off, the farther one almost true.
  const drawn = [{ ...c.ends[0], angle: c.ends[0].angle + 9 }, { ...c.ends[1], angle: c.ends[1].angle + 2 }];
  const minor = drawn.map((e) => {
    const t = ((e.angle + 90) * Math.PI) / 180;
    const k = e.ry * 2.1;
    return kit.line(e.cx - Math.cos(t) * k, e.cy - Math.sin(t) * k, e.cx + Math.cos(t) * k, e.cy + Math.sin(t) * k, { cls: 'd-mark', width: 2 });
  });
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }),
    drawn.map((e, i) => hand(kit, e, 5 + i * 4)),
    c.sides.map(([p, q]) => kit.line(p[0], p[1], q[0], q[1], { width: 2.2 })),
    kit.line(a[0], a[1], b[0], b[1], { width: 1.5, dash: '7 5' }),
    minor,
    kit.text(32, 330, 'dashed: the axis you drew', { anchor: 'start', size: 13 }),
    kit.text(508, 330, 'green: the line that halves each ellipse', { anchor: 'end', size: 13 }),
  );
};
