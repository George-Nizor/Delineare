// Cylinders for lesson 14 and 15's diagrams (not a diagram itself). A cylinder is two real circles in
// 3D joined by straight sides, projected by a camera, so the far ellipse is rounder, the sides
// converge and the axis passes through both ellipses.
import { add, mul, norm, circle3, camera } from '../../12-plotted-boxes/diagrams/geom.js';

// Centre and shape of an ellipse from points around it: principal axes of the points.
export function ellipseOf(pts) {
  const n = pts.length;
  const cx = pts.reduce((a, p) => a + p[0], 0) / n;
  const cy = pts.reduce((a, p) => a + p[1], 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (const [x, y] of pts) {
    sxx += (x - cx) ** 2;
    sxy += (x - cx) * (y - cy);
    syy += (y - cy) ** 2;
  }
  const theta = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  let rmax = 0;
  let rmin = 1e9;
  for (const [x, y] of pts) {
    const u = (x - cx) * Math.cos(theta) + (y - cy) * Math.sin(theta);
    const v = -(x - cx) * Math.sin(theta) + (y - cy) * Math.cos(theta);
    rmax = Math.max(rmax, Math.abs(u));
    rmin = Math.min(rmin, Math.abs(v));
  }
  let rx = 0;
  let ry = 0;
  for (const [x, y] of pts) {
    rx = Math.max(rx, Math.abs((x - cx) * Math.cos(theta) + (y - cy) * Math.sin(theta)));
    ry = Math.max(ry, Math.abs(-(x - cx) * Math.sin(theta) + (y - cy) * Math.cos(theta)));
  }
  return { cx, cy, rx, ry, angle: (theta * 180) / Math.PI };
}

// Convex hull (Andrew's monotone chain), returned as indices into pts.
function hull(pts) {
  const idx = pts.map((_, i) => i).sort((a, b) => pts[a][0] - pts[b][0] || pts[a][1] - pts[b][1]);
  const cross = (o, a, b) => (pts[a][0] - pts[o][0]) * (pts[b][1] - pts[o][1]) - (pts[a][1] - pts[o][1]) * (pts[b][0] - pts[o][0]);
  const lower = [];
  for (const i of idx) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], i) <= 0) lower.pop();
    lower.push(i);
  }
  const upper = [];
  for (const i of idx.slice().reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], i) <= 0) upper.pop();
    upper.push(i);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// A cylinder whose first end centre is c0, running `len` along unit axis `axis`, with radius r.
export function cylinder(cam, { c0, axis, len, r }) {
  const a = norm(axis);
  const c1 = add(c0, mul(a, len));
  const near = circle3(cam, c0, a, r);
  const far = circle3(cam, c1, a, r);
  // The two straight sides are the outer tangents of the two ellipses: the hull edges that join
  // one ellipse to the other.
  const all = near.concat(far);
  const h = hull(all);
  const sides = [];
  for (let i = 0; i < h.length; i += 1) {
    const p = h[i];
    const q = h[(i + 1) % h.length];
    if ((p < near.length) !== (q < near.length)) sides.push([all[p], all[q]]);
  }
  // Order each side from the near ellipse to the far one.
  const ordered = sides.map(([p, q]) => (all.indexOf(p) < near.length ? [p, q] : [q, p]));
  return {
    axis: a, p0: cam.project(c0), p1: cam.project(c1), vp: cam.vp(a),
    ends: [ellipseOf(near), ellipseOf(far)], near, far, sides: ordered,
  };
}

export const defaultCamera = () => camera({ f: 330, cx: 270, cy: 190, pitch: 0.25 });

// Where along the line p0 to p1 the point t sits (t = 0 at p0, 1 at p1).
export const along = (p0, p1, t) => [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];

// The cylinder most diagrams here show, big enough to fill a 540 by 360 frame.
export function std({ axis = [0.9, 0.22, 0.7], c0 = [-1.75, -1.5, 6.2], len = 4.6, r = 1.15, f = 430, cy = 200, pitch = 0.2 } = {}) {
  const cam = camera({ f, cx: 270, cy, pitch });
  return { cam, cyl: cylinder(cam, { c0, axis, len, r }) };
}

// A hand-drawn look for an ellipse: two passes, the way lesson 2 draws them.
export const hand = (kit, e, seed = 5, width = 2.2) => kit.handEllipse(e.cx, e.cy, e.rx, e.ry, { angle: e.angle, passes: 2, seed, drift: 1.4, width });

// The axis line, running past both ends by `pad` of its length.
export function axisLine(kit, c, { pad = 0.35, cls = 'd-mark', width = 1.6, dash } = {}) {
  const a = along(c.p0, c.p1, -pad);
  const b = along(c.p0, c.p1, 1 + pad);
  return kit.line(a[0], a[1], b[0], b[1], { cls, width, dash });
}

// A line from p towards the vanishing point vp, drawn for `t` of the way.
export const toward = (kit, p, vp, t, opts = {}) => {
  const q = along(p, vp, t);
  return kit.line(p[0], p[1], q[0], q[1], opts);
};
