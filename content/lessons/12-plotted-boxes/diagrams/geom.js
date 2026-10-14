// Perspective geometry for the diagrams of lessons 12 to 16 and 19. Not a diagram itself (the
// diagram sheet only loads .mjs files). Everything here is real projection: a pinhole camera at the
// origin looking along +Z, y up, optionally pitched down, so vanishing points, horizons and
// ellipses come out where a camera would put them.

export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export function camera({ f = 700, cx = 270, cy = 170, pitch = 0 } = {}) {
  const c = Math.cos(pitch);
  const s = Math.sin(pitch);
  const toCam = ([x, y, z]) => [x, y * c + z * s, -y * s + z * c];
  const project = (p) => {
    const [x, y, z] = toCam(p);
    return [cx + (f * x) / z, cy - (f * y) / z];
  };
  // Vanishing point of a direction, or null when it is parallel to the picture.
  const vp = (d) => {
    const [x, y, z] = toCam(d);
    if (Math.abs(z) < 1e-9) return null;
    return [cx + (f * x) / z, cy - (f * y) / z];
  };
  const horizonY = cy - f * Math.tan(pitch);
  return { project, vp, horizonY, f, cx, cy, pitch };
}

// A box with one base corner at `at`, edges along u (yaw `yaw`), up (height) and v. Corner index
// bits: 1 = along u, 2 = up, 4 = along v. Returns projected corners, the twelve edges (each with
// whether a viewer at the eye sees it) and the faces the viewer sees.
export function box(cam, { at, w, h, d, yaw = 0 }) {
  const u = [Math.cos(yaw), 0, Math.sin(yaw)];
  const v = [-Math.sin(yaw), 0, Math.cos(yaw)];
  const up = [0, 1, 0];
  const world = [];
  for (let i = 0; i < 8; i += 1) {
    world.push(add(at, add(add(mul(u, w * (i & 1)), mul(up, h * ((i >> 1) & 1))), mul(v, d * ((i >> 2) & 1)))));
  }
  const corners = world.map((p) => cam.project(p));
  const faces = [
    { n: mul(u, -1), c: [0, 2, 4, 6] }, { n: u, c: [1, 3, 5, 7] },
    { n: mul(up, -1), c: [0, 1, 4, 5] }, { n: up, c: [2, 3, 6, 7] },
    { n: mul(v, -1), c: [0, 1, 2, 3] }, { n: v, c: [4, 5, 6, 7] },
  ].map((face) => {
    const centre = mul(face.c.map((i) => world[i]).reduce((acc, p) => add(acc, p), [0, 0, 0]), 0.25);
    return { ...face, seen: dot3(face.n, mul(centre, -1)) > 0 };
  });
  const edges = [];
  for (let i = 0; i < 8; i += 1) {
    for (const bit of [1, 2, 4]) {
      if (!(i & bit)) {
        const j = i | bit;
        const seen = faces.some((face) => face.seen && face.c.includes(i) && face.c.includes(j));
        edges.push({ a: i, b: j, seen, axis: bit === 1 ? 'u' : bit === 2 ? 'up' : 'v' });
      }
    }
  }
  return { corners, edges, faces, world, dirs: { u, v, up } };
}

// Draw a box: edges the viewer sees in ink, the rest (drawn through) in guide colour unless
// `through` is false.
export function drawBox(kit, b, { width = 2, through = true, hiddenDash = '4 5', cls = 'd-ink', hiddenCls = 'd-guide' } = {}) {
  const out = [];
  for (const e of b.edges) {
    const [x1, y1] = b.corners[e.a];
    const [x2, y2] = b.corners[e.b];
    if (e.seen) out.push(kit.line(x1, y1, x2, y2, { width, cls }));
    else if (through) out.push(kit.line(x1, y1, x2, y2, { width: width * 0.75, cls: hiddenCls, dash: hiddenDash }));
  }
  return out;
}

// Intersection of two 2D lines through (p1, p2) and (p3, p4).
export function meet(p1, p2, p3, p4) {
  const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]);
  const a = p1[0] * p2[1] - p1[1] * p2[0];
  const b = p3[0] * p4[1] - p3[1] * p4[0];
  return [(a * (p3[0] - p4[0]) - (p1[0] - p2[0]) * b) / d, (a * (p3[1] - p4[1]) - (p1[1] - p2[1]) * b) / d];
}

// The point on the line from p towards q at a given x.
export const atX = (p, q, x) => [x, p[1] + ((q[1] - p[1]) * (x - p[0])) / (q[0] - p[0])];

// A line from p through q, continued by `extra` units beyond q.
export function beyond(p, q, extra) {
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
  return [q[0] + ((q[0] - p[0]) / len) * extra, q[1] + ((q[1] - p[1]) / len) * extra];
}

// A ruled two-point box between vanishing points L and R, from a first vertical at x = v running
// y1 (top) to y2 (bottom), side verticals at xa (towards L) and xb (towards R). Follows
// Drawabox's plotted-perspective steps, so every point comes from intersecting ruled lines.
export function plotted(L, R, { v, y1, y2, xa, xb }) {
  const top = [v, y1];
  const bottom = [v, y2];
  const lt = atX(top, L, xa);
  const lb = atX(bottom, L, xa);
  const rt = atX(top, R, xb);
  const rb = atX(bottom, R, xb);
  const backTop = meet(lt, R, rt, L);
  const backBottom = meet(lb, R, rb, L);
  const hy = L[1];
  const topSeen = y1 > hy;
  const bottomSeen = y2 < hy;
  const P = { Tf: top, Bf: bottom, Tl: lt, Bl: lb, Tr: rt, Br: rb, Tb: backTop, Bb: backBottom };
  const edges = [
    ['Tf', 'Bf', true], ['Tl', 'Bl', true], ['Tr', 'Br', true], ['Tb', 'Bb', false],
    ['Tf', 'Tl', true], ['Tf', 'Tr', true], ['Tl', 'Tb', topSeen], ['Tr', 'Tb', topSeen],
    ['Bf', 'Bl', true], ['Bf', 'Br', true], ['Bl', 'Bb', bottomSeen], ['Br', 'Bb', bottomSeen],
  ].map(([a, b, seen]) => ({ a: P[a], b: P[b], seen, name: `${a}-${b}` }));
  return { P, edges, L, R };
}

export function drawPlotted(kit, p, { width = 2, through = true, only } = {}) {
  return p.edges.filter((e) => !only || only(e)).map((e) => (e.seen
    ? kit.line(e.a[0], e.a[1], e.b[0], e.b[1], { width })
    : through ? kit.line(e.a[0], e.a[1], e.b[0], e.b[1], { width: width * 0.75, cls: 'd-guide', dash: '4 5' }) : ''));
}

// A circle in 3D (centre c, unit axis n, radius r) as a closed list of projected points.
export function circle3(cam, c, n, r, steps = 90) {
  const ref = Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const a = norm(cross(n, ref));
  const b = cross(n, a);
  const pts = [];
  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    pts.push(cam.project(add(c, add(mul(a, Math.cos(t) * r), mul(b, Math.sin(t) * r)))));
  }
  return pts;
}
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => mul(a, 1 / Math.hypot(...a));

export const closedPath = (pts) => `M ${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ')} Z`;

// The frame every plotted-box diagram shares: a ruled rectangle, a horizon and a dot at each end.
export const FRAME = { x: 16, y: 16, w: 508, h: 298 };
export const L0 = [48, 100];
export const R0 = [492, 100];
export function frame(kit, { hy = 100, label = true } = {}) {
  return [
    kit.rect(FRAME.x, FRAME.y, FRAME.w, FRAME.h, { rx: 4 }),
    kit.line(FRAME.x + 6, hy, FRAME.x + FRAME.w - 6, hy, { cls: 'd-mark', width: 1.6 }),
    kit.dot(48, hy, { r: 4.5, cls: 'd-mark-fill' }), kit.dot(492, hy, { r: 4.5, cls: 'd-mark-fill' }),
    label ? kit.text(270, hy - 8, 'horizon', { anchor: 'middle', size: 12 }) : '',
  ];
}
