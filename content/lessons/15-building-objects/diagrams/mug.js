// A mug built from forms, for lesson 15's diagrams (not a diagram itself): a cylinder for the body,
// a curved band for the handle, and the intersection ovals where the handle meets the body. All of it
// is projected from 3D, so the parts agree with each other.
import { camera, add, mul } from '../../12-plotted-boxes/diagrams/geom.js';
import { cylinder, ellipseOf } from '../../14-cylinders/diagrams/cyl.js';

const R = 1.5;
const H = 3.3;
const BASE = [0, -4.4, 6.6];

export function mug({ pitch = 0.5, f = 500, cx = 255, cy = 215, handle = 1 } = {}) {
  const cam = camera({ f, cx, cy, pitch });
  const cyl = cylinder(cam, { c0: BASE, axis: [0, 1, 0], len: H, r: R });
  const P = (x, y, z) => cam.project([BASE[0] + x, BASE[1] + y, BASE[2] + z]);
  // The handle is a C in the plane z = 0 of the mug, on its +x side: a centre line, an outer and an
  // inner edge, and the circle where each end meets the body.
  const mid = H * 0.52;
  const a = 1.35;
  const b = 1.0;
  const w = 0.22;
  const steps = 28;
  const curve = (ra, rb) => Array.from({ length: steps + 1 }, (_, i) => {
    const t = -Math.PI / 2 + (i / steps) * Math.PI;
    return P(handle * (R - 0.1 + ra * Math.cos(t)), mid + rb * Math.sin(t), 0);
  });
  const outer = curve(a + w, b + w);
  const inner = curve(a - w, b - w);
  const centre = curve(a, b);
  // A tube cross-section at each end of the handle: a small circle facing along x.
  const endCircle = (yy) => Array.from({ length: 40 }, (_, i) => {
    const t = (i / 40) * Math.PI * 2;
    return P(handle * (R - 0.1 + a * 0 + 0), yy + w * Math.cos(t), w * Math.sin(t));
  });
  // Where each end of the handle meets the cylinder: the circle pushed onto the body's surface.
  const join = (yy) => Array.from({ length: 48 }, (_, i) => {
    const t = (i / 48) * Math.PI * 2;
    const z = w * 1.15 * Math.sin(t);
    const x = Math.sqrt(R * R - z * z);
    return P(handle * x, yy + w * 1.15 * Math.cos(t), z);
  });
  const joins = [join(mid + b), join(mid - b)];
  // Rim thickness: a smaller circle just inside the top, and the foot ring just above the base.
  const ring = (y, r) => Array.from({ length: 72 }, (_, i) => {
    const t = (i / 72) * Math.PI * 2;
    return P(r * Math.cos(t), y, r * Math.sin(t));
  });
  return {
    cam, cyl, outer, inner, centre, joins, rimInner: ring(H, R - 0.17), foot: ring(0.22, R - 0.02), cupInner: ring(H - 0.01, R - 0.17),
    P, end: [P(handle * R, mid + b, 0), P(handle * R, mid - b, 0)], ellipses: cyl.ends,
  };
}

// The half of a closed ring of screen points that lies below (front) or above (back) its centre.
export function halves(pts) {
  const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
  const open = (arr) => {
    // Rotate so the list starts at the leftmost point, then split there into two runs.
    const k = arr.reduce((best, p, i) => (p[0] < arr[best][0] ? i : best), 0);
    const rot = arr.slice(k).concat(arr.slice(0, k));
    const right = rot.reduce((best, p, i) => (p[0] > rot[best][0] ? i : best), 0);
    return [rot.slice(0, right + 1), rot.slice(right).concat([rot[0]])];
  };
  const [one, two] = open(pts);
  const avg = (run) => run.reduce((s, p) => s + p[1], 0) / run.length;
  return avg(one) > avg(two) ? { front: one, back: two } : { front: two, back: one };
}

// Draw helpers shared by the diagrams. `kit` is the diagram kit.
export function parts(kit, m, { through = true, width = 2.2 } = {}) {
  const base = halves(m.cyl.near);
  const out = {
    body: [
      kit.smooth(m.cyl.far, { width, closed: true }),
      kit.smooth(base.front, { width }),
      through ? kit.smooth(base.back, { width: width * 0.75, cls: 'd-guide', dash: '4 5' }) : '',
      m.cyl.sides.map(([p, q]) => kit.line(p[0], p[1], q[0], q[1], { width })),
    ],
    handle: [kit.smooth(m.outer, { width }), kit.smooth(m.inner, { width })],
    axis: kit.line(...m.cyl.p0, ...m.cyl.p1, { cls: 'd-mark', width: 1.4, dash: '6 5' }),
    joins: m.joins.map((j) => kit.smooth(j, { cls: 'd-mark', width: width * 1.1, closed: true })),
    rim: kit.smooth(m.rimInner, { width: width * 0.9, closed: true }),
    foot: (() => { const f = halves(m.foot); return [kit.smooth(f.front, { width: width * 0.9 }), through ? kit.smooth(f.back, { width: width * 0.7, cls: 'd-guide', dash: '4 5' }) : '']; })(),
  };
  return out;
}
