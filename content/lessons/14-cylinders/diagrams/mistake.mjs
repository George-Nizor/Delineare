// The usual mistake: drawing the sides parallel on the page, which sends the vanishing point to
// infinity. Left, the far ellipse is a copy of the near one and the common tangents are parallel.
// Right, the true cylinder: the sides converge.
import { std, hand } from './cyl.js';

// Half the width of ellipse e measured across direction n (the support function of the ellipse).
const support = (e, n) => {
  const t = (e.angle * Math.PI) / 180;
  const a = n[0] * Math.cos(t) + n[1] * Math.sin(t);
  const b = -n[0] * Math.sin(t) + n[1] * Math.cos(t);
  return Math.hypot(e.rx * a, e.ry * b);
};

export default (kit) => {
  const { cyl: c } = std();
  const [e0, e1] = c.ends;
  const dx = c.p1[0] - c.p0[0];
  const dy = c.p1[1] - c.p0[1];
  const len = Math.hypot(dx, dy);
  const n = [-dy / len, dx / len];
  const h = support(e0, n);
  const copy = { ...e0, cx: e0.cx + dx, cy: e0.cy + dy };
  const sc = 0.62;
  const place = (x, art) => `<g transform="translate(${(x + 128 - 224 * sc).toFixed(2)} ${(150 - 188 * sc).toFixed(2)}) scale(${sc})">${art.flat(Infinity).join('')}</g>`;
  const bad = [hand(kit, e0, 5, 3.4), hand(kit, copy, 9, 3.4), [1, -1].map((s) => kit.line(e0.cx + n[0] * h * s, e0.cy + n[1] * h * s, copy.cx + n[0] * h * s, copy.cy + n[1] * h * s, { width: 3.4 }))];
  const good = [hand(kit, e0, 5, 3.4), hand(kit, e1, 9, 3.4), c.sides.map(([p, q]) => kit.line(p[0], p[1], q[0], q[1], { width: 3.4 }))];
  return kit.svg({ width: 560, height: 280 },
    kit.rect(16, 16, 256, 250, { rx: 3 }), kit.tag(144, 44, 'Sides parallel', { tone: 'bad' }), place(16, bad),
    kit.rect(288, 16, 256, 250, { rx: 3 }), kit.tag(416, 44, 'Sides converging', { tone: 'mark' }), place(288, good),
  );
};
