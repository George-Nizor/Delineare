// A hand built from simple forms, drawn from real geometry and turned to any view. Not a diagram
// itself. The unit is the length of the palm. In the hand's frame x runs across (pinky at -x,
// thumb at +x), y toward the fingertips and z out of the back of the hand.
//
// The palm is a box about as wide as it is tall whose front plane (the knuckle edge) is curved,
// since the little-finger side is shorter. The wrist is a narrower box. Each finger is three
// capsules and the thumb is a triangular box, a cylinder and a wedge.

const rad = (d) => (d * Math.PI) / 180;
const rot = ({ yaw = 0, pitch = 0, roll = 0 }) => (p) => {
  let [x, y, z] = p;
  const cr = Math.cos(rad(roll)); const sr = Math.sin(rad(roll));
  [x, y] = [x * cr - y * sr, x * sr + y * cr];
  const cp = Math.cos(rad(pitch)); const sp = Math.sin(rad(pitch));
  [y, z] = [y * cp - z * sp, y * sp + z * cp];
  const cy = Math.cos(rad(yaw)); const sy = Math.sin(rad(yaw));
  [x, z] = [x * cy + z * sy, -x * sy + z * cy];
  return [x, y, z];
};
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// Knuckle line: the front plane's top edge. The pinky side is lower, the middle finger highest.
const KNUCKLE_X = [-0.375, -0.125, 0.125, 0.375];
const KNUCKLE_Y = [0.9, 0.99, 1.03, 0.98];
export const knuckleY = (x) => {
  // Smooth through the four knuckle heights, held flat to the edges.
  const xs = [-0.5, ...KNUCKLE_X, 0.5];
  const ys = [0.86, ...KNUCKLE_Y, 0.94];
  for (let i = 0; i < xs.length - 1; i += 1) if (x <= xs[i + 1]) { const t = (x - xs[i]) / (xs[i + 1] - xs[i]); const u = t * t * (3 - 2 * t); return ys[i] + (ys[i + 1] - ys[i]) * u; }
  return ys[ys.length - 1];
};

// Polyhedron drawn as edges; an edge is solid when any face beside it faces the viewer.
function solid(kit, faces, R, P, { cls = 'd-ink', width = 1.6 } = {}) {
  const info = faces.map((f) => {
    const w = f.map(R);
    let n = [0, 0, 0];
    for (let i = 0; i < w.length; i += 1) { const a = w[i]; const b = w[(i + 1) % w.length]; n = [n[0] + (a[1] - b[1]) * (a[2] + b[2]), n[1] + (a[2] - b[2]) * (a[0] + b[0]), n[2] + (a[0] - b[0]) * (a[1] + b[1])]; }
    return { f, front: n[2] > 0 };
  });
  const edges = new Map();
  for (const { f, front } of info) {
    for (let i = 0; i < f.length; i += 1) {
      const a = f[i]; const b = f[(i + 1) % f.length];
      const key = [a, b].map((p) => p.map((c) => c.toFixed(3)).join(',')).sort().join('|');
      const e = edges.get(key) || { a, b, front: false };
      e.front = e.front || front;
      edges.set(key, e);
    }
  }
  const out = [];
  for (const e of edges.values()) {
    const A = P(e.a); const B = P(e.b);
    out.push(e.front ? kit.line(A[0], A[1], B[0], B[1], { cls, width }) : kit.line(A[0], A[1], B[0], B[1], { cls: 'd-guide', width: width - 0.5, dash: '3 4' }));
  }
  return out;
}

function capsule(kit, [x1, y1], [x2, y2], r1, r2, opts) {
  const dx = x2 - x1; const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len; const ny = dx / len;
  const p = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  return kit.path(`M ${p(x1 + nx * r1, y1 + ny * r1)} L ${p(x2 + nx * r2, y2 + ny * r2)} A ${r2} ${r2} 0 0 0 ${p(x2 - nx * r2, y2 - ny * r2)} L ${p(x1 - nx * r1, y1 - ny * r1)} A ${r1} ${r1} 0 0 0 ${p(x1 + nx * r1, y1 + ny * r1)} Z`, opts);
}

// Finger joints in the hand's frame: base, then three more points, from flexion angles in degrees.
function fingerJoints(i, { flex = [0, 0, 0], spread = 0, equal = false }) {
  const total = equal ? 0.85 : [0.62, 0.82, 0.9, 0.8][i];
  const parts = [0.5 * total, 0.28 * total, 0.22 * total];
  let [x, y, z] = [KNUCKLE_X[i], KNUCKLE_Y[i], 0];
  const pts = [[x, y, z]];
  let angle = 0;
  const side = [-8, -3, 0, 6][i] + spread;
  parts.forEach((len, k) => {
    angle += flex[k] || 0;
    x += Math.sin(rad(side)) * len * Math.cos(rad(angle));
    y += Math.cos(rad(side)) * len * Math.cos(rad(angle));
    z -= Math.sin(rad(angle)) * len;
    pts.push([x, y, z]);
  });
  return pts;
}

// Draw a hand. `layers`: palm, wrist, fingers, thumb, forearm, divisions. `flex` is per finger.
export function hand(kit, { x, y, s, view = {}, layers = ['palm', 'wrist', 'fingers', 'thumb'], flex = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]], spread = 0, thumbOut = 38, width = 1.7, equalTubes = false, mark = [] }) {
  const R = rot(view);
  const P = (p) => { const q = R(p); return [x + q[0] * s, y - q[1] * s, q[2]]; };
  const out = [];
  const t = 0.14;
  const cls = (name) => (mark.includes(name) ? 'd-mark' : 'd-ink');

  if (layers.includes('forearm')) {
    const f = [[-0.42, -1.45, -0.2], [0.42, -1.45, -0.2], [0.42, -0.5, -0.2], [-0.42, -0.5, -0.2], [-0.42, -1.45, 0.2], [0.42, -1.45, 0.2], [0.42, -0.5, 0.2], [-0.42, -0.5, 0.2]];
    out.push(solid(kit, [[f[0], f[1], f[2], f[3]], [f[4], f[5], f[6], f[7]], [f[0], f[1], f[5], f[4]], [f[3], f[2], f[6], f[7]], [f[0], f[3], f[7], f[4]], [f[1], f[2], f[6], f[5]]], R, P, { cls: 'd-guide', width: 1.4 }));
  }
  if (layers.includes('wrist')) {
    const w = [[-0.34, -0.55, -0.11], [0.34, -0.55, -0.11], [0.34, 0.02, -0.11], [-0.34, 0.02, -0.11], [-0.34, -0.55, 0.11], [0.34, -0.55, 0.11], [0.34, 0.02, 0.11], [-0.34, 0.02, 0.11]];
    out.push(solid(kit, [[w[0], w[1], w[2], w[3]], [w[4], w[5], w[6], w[7]], [w[0], w[1], w[5], w[4]], [w[3], w[2], w[6], w[7]], [w[0], w[3], w[7], w[4]], [w[1], w[2], w[6], w[5]]], R, P, { cls: cls('wrist'), width }));
  }
  if (layers.includes('palm')) {
    const xs = Array.from({ length: 11 }, (_, i) => -0.5 + i * 0.1);
    const front = xs.map((px) => [px, knuckleY(px), t]);
    const back = xs.map((px) => [px, knuckleY(px), -t]);
    const bl = [-0.5, 0, t]; const br = [0.5, 0, t]; const bbl = [-0.5, 0, -t]; const bbr = [0.5, 0, -t];
    const faces = [
      [bl, br, ...front.slice().reverse()], // the face toward the viewer in a back view
      [bbl, bbr, ...back.slice().reverse()],
      [bl, bbl, back[0], front[0]],
      [br, bbr, back[10], front[10]],
      [bl, br, bbr, bbl],
      [...front, ...back.slice().reverse()], // the front plane: the top, where the fingers start
    ];
    out.push(solid(kit, faces, R, P, { cls: cls('palm'), width }));
    if (layers.includes('divisions')) {
      for (const px of [-0.25, 0, 0.25]) {
        const a = P([px, knuckleY(px), t]); const b = P([px, knuckleY(px), -t]);
        out.push(kit.line(a[0], a[1], b[0], b[1], { cls: 'd-mark', width: 2 }));
      }
      // Draw the front plane's outline again in the mark colour.
      out.push(kit.smooth(front.map((p) => P(p).slice(0, 2)), { cls: 'd-mark', width: 2.4 }));
      out.push(kit.smooth(back.map((p) => P(p).slice(0, 2)), { cls: 'd-mark', width: 2.4 }));
    }
  }
  if (layers.includes('fingers')) {
    const order = [0, 1, 2, 3].map((i) => ({ i, pts: fingerJoints(i, { flex: flex[i], spread, equal: equalTubes }) })).sort((a, b) => R(a.pts[2])[2] - R(b.pts[2])[2]);
    for (const { i, pts } of order) {
      const r0 = [0.082, 0.098, 0.1, 0.095][i];
      const proj = pts.map((p) => P(p));
      const radii = equalTubes ? [r0, r0, r0, r0] : [r0, r0 * 0.88, r0 * 0.78, r0 * 0.66];
      for (let k = 0; k < 3; k += 1) out.push(capsule(kit, proj[k], proj[k + 1], radii[k] * s, radii[k + 1] * s, { cls: cls('fingers'), width: width - 0.2 }));
    }
  }
  if (layers.includes('thumb')) {
    // A triangular box at the base, a cylinder for the first segment, a wedge for the tip.
    const th = 0.09;
    const a = [0.5, 0.0]; const b = [0.5, 0.58]; const c = [0.5 + 0.5 * Math.cos(rad(thumbOut)), 0.58 * 0.62 + 0.5 * Math.sin(rad(thumbOut)) * 0.35];
    const tri = (z) => [[a[0], a[1], z], [b[0], b[1], z], [c[0], c[1], z]];
    const lo = tri(-th); const hi = tri(th);
    out.push(solid(kit, [[...lo], [...hi].reverse(), [lo[0], lo[1], hi[1], hi[0]], [lo[1], lo[2], hi[2], hi[1]], [lo[2], lo[0], hi[0], hi[2]]], R, P, { cls: cls('thumb'), width }));
    const dir = [Math.cos(rad(thumbOut - 8)), Math.sin(rad(thumbOut + 18)) * 0.8, -0.1];
    const m = Math.hypot(...dir);
    const base = [c[0], c[1], 0];
    const knuckle = [base[0] + (dir[0] / m) * 0.42, base[1] + (dir[1] / m) * 0.42, base[2] + (dir[2] / m) * 0.42];
    const tip = [knuckle[0] + (dir[0] / m) * 0.3, knuckle[1] + (dir[1] / m) * 0.3 + 0.03, knuckle[2] - 0.03];
    const [p0, p1, p2] = [P(base), P(knuckle), P(tip)];
    out.push(capsule(kit, p0, p1, 0.1 * s, 0.085 * s, { cls: cls('thumb'), width: width - 0.2 }));
    out.push(capsule(kit, p1, p2, 0.085 * s, 0.055 * s, { cls: cls('thumb'), width: width - 0.2 }));
  }
  return out;
}
