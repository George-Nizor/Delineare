// The Y: three lines from one point, with every angle between them wider than 90 degrees. The point
// is the box's nearest corner, and each arm is aimed at a vanishing point.
import { scene } from './scene.js';

export default (kit) => {
  const s = scene();
  const c = s.b.corners;
  const n = c[s.near];
  // The three edges leaving the nearest corner.
  const ends = s.b.edges.filter((e) => e.a === s.near || e.b === s.near).map((e) => c[e.a === s.near ? e.b : e.a]);
  const ang = ends.map((p) => Math.atan2(p[1] - n[1], p[0] - n[0]));
  const arcs = [];
  for (let i = 0; i < 3; i += 1) {
    const a1 = ang[i];
    let a2 = ang[(i + 1) % 3];
    let diff = a2 - a1;
    while (diff < 0) diff += Math.PI * 2;
    if (diff > Math.PI) { a2 = ang[i]; diff = Math.PI * 2 - diff; }
    const start = diff > Math.PI ? ang[(i + 1) % 3] : a1;
    arcs.push({ start, diff: Math.min(diff, Math.PI * 2 - diff) });
  }
  return kit.svg({ width: 540, height: 360 },
    kit.rect(16, 8, 508, 344, { rx: 4 }),
    ['u', 'v', 'up'].map((k) => kit.dot(s.vps[k][0], s.vps[k][1], { r: 4.5, cls: 'd-mark-fill' })),
    ends.map((p) => kit.line(n[0], n[1], p[0], p[1], { width: 3 })),
    kit.dot(n[0], n[1], { r: 4.5 }),
    kit.text(n[0] + 14, n[1] + 40, 'nearest corner', { size: 12 }),
    kit.text(32, 336, 'every angle over 90 degrees', { size: 13 }),
  );
};
