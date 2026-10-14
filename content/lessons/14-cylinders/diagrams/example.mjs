// A finished page: five cylinders, each built round its own axis, turned to different angles, some
// foreshortened more than others.
import { std, hand, along } from './cyl.js';

export default (kit) => {
  const specs = [
    { o: { axis: [0.9, 0.22, 0.7] }, at: [140, 90, 0.5] },
    { o: { axis: [0.2, 0.15, 1.0], len: 3.4, r: 1.0 }, at: [400, 88, 0.52] },
    { o: { axis: [-0.8, 0.5, 0.6], len: 4.2, r: 0.9 }, at: [270, 190, 0.52] },
    { o: { axis: [0.95, -0.2, 0.2], len: 5, r: 0.9, c0: [-2.4, -1.5, 7] }, at: [135, 268, 0.46] },
    { o: { axis: [0.1, 1.0, 0.5], len: 3.2, r: 0.8, c0: [0, -3.3, 6.2] }, at: [420, 262, 0.46] },
  ];
  const art = specs.map(({ o, at }, i) => {
    const { cyl: c } = std(o);
    const pts = c.near.concat(c.far);
    const x0 = Math.min(...pts.map((p) => p[0]));
    const x1 = Math.max(...pts.map((p) => p[0]));
    const y0 = Math.min(...pts.map((p) => p[1]));
    const y1 = Math.max(...pts.map((p) => p[1]));
    const [cx, cy, sc] = at;
    const a = along(c.p0, c.p1, -0.05);
    const z = along(c.p0, c.p1, 1.05);
    return `<g transform="translate(${(cx - ((x0 + x1) / 2) * sc).toFixed(2)} ${(cy - ((y0 + y1) / 2) * sc).toFixed(2)}) scale(${sc})">${[
      kit.line(a[0], a[1], z[0], z[1], { cls: 'd-guide', width: 2, dash: '8 6' }),
      c.ends.map((e, k) => hand(kit, e, 3 + i * 7 + k * 3, 3.6)),
      c.sides.map(([p, q]) => kit.line(p[0], p[1], q[0], q[1], { width: 3.6 })),
    ].flat(Infinity).join('')}</g>`;
  });
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 12, 508, 316, { rx: 4 }), art);
};
