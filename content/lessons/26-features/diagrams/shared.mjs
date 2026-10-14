// A Loomis head drawn from real geometry, turned to any angle. Not a diagram itself.
//
// In the head's own frame x is to its left, y up, z out of the face, and the ball has radius 1.
// A flat slice is cut off each side at x = +-SLICE. The brow line is the equator, the centre line
// the meridian down the face. Hairline, nose line and chin sit one equal step apart down the
// centre line: Loomis puts the hairline halfway from the brow to the top of the ball.

const rad = (d) => (d * Math.PI) / 180;
export const SLICE = 0.72;
const STEP = 0.5;

// Turn the head: `yaw` turns it about the vertical, `pitch` tips it forward (positive looks down),
// `roll` tilts it toward a shoulder.
function turn([x, y, z], { yaw = 0, pitch = 0, roll = 0 }) {
  const cr = Math.cos(rad(roll)); const sr = Math.sin(rad(roll));
  let [a, b, c] = [x * cr - y * sr, x * sr + y * cr, z];
  const cp = Math.cos(rad(pitch)); const sp = Math.sin(rad(pitch));
  [b, c] = [b * cp - c * sp, b * sp + c * cp];
  const cy = Math.cos(rad(yaw)); const sy = Math.sin(rad(yaw));
  [a, c] = [a * cy + c * sy, -a * sy + c * cy];
  return [a, b, c];
}

// Draw a head. `layers` picks what to show: ball, cross, plane, face, jaw, ear. Parts behind the
// ball are drawn faint.
export function head(kit, { x, y, r, yaw = 0, pitch = 0, roll = 0, layers = ['ball', 'cross', 'plane', 'face', 'jaw', 'ear'], width = 1.8, plain = false }) {
  const view = { yaw, pitch, roll };
  const P = (p) => { const q = turn(p, view); return [x + q[0] * r, y - q[1] * r, q[2]]; };
  const out = [];
  const ink = plain ? 'd-ink' : 'd-ink';

  // A 3D curve; the parts that face away are drawn faint and dashed. `onBall` curves are tested
  // against the ball's surface, others by depth.
  const curve = (points, { cls = ink, w = width, onBall = true, closed = false } = {}) => {
    let run = [];
    let front = null;
    const flush = () => {
      if (run.length > 1) out.push(kit.smooth(run.map((p) => [p[0], p[1]]), front ? { cls, width: w } : { cls: 'd-guide', width: w - 0.6, dash: '3 4' }));
      run = [];
    };
    const list = closed ? [...points, points[0]] : points;
    for (const p of list) {
      const q = P(p);
      const facing = onBall ? q[2] > -0.02 : q[2] > -0.3;
      if (front !== null && facing !== front) { run.push(q); flush(); }
      front = facing;
      run.push(q);
    }
    flush();
  };
  const circleOnBall = (fn, n = 72, from = 0, to = 360) => Array.from({ length: n + 1 }, (_, i) => fn(rad(from + ((to - from) * i) / n)));

  if (layers.includes('ball')) out.push(kit.circle(x, y, r, { width }));
  if (layers.includes('cross')) {
    curve(circleOnBall((t) => [Math.sin(t), 0, Math.cos(t)]), { cls: 'd-mark', w: 1.9 });
    curve(circleOnBall((t) => [0, Math.sin(t), Math.cos(t)]), { cls: 'd-mark', w: 1.9 });
  }
  if (layers.includes('plane')) {
    const rs = Math.sqrt(1 - SLICE * SLICE);
    for (const s of [1, -1]) curve(circleOnBall((t) => [s * SLICE, rs * Math.sin(t), rs * Math.cos(t)]), { w: 1.7, onBall: false });
  }
  if (layers.includes('face')) {
    // Hairline, nose line and chin line: latitude arcs across the front of the face.
    for (const h of [STEP, -STEP]) {
      const k = Math.sqrt(1 - h * h);
      const reach = (Math.asin(Math.min(1, (SLICE * 0.96) / k)) * 180) / Math.PI;
      curve(circleOnBall((t) => [k * Math.sin(t), h, k * Math.cos(t)], 40, -reach, reach), { w: 1.4 });
    }
    const chin = 0.46;
    curve(circleOnBall((t) => [chin * Math.sin(t), -1.08, 0.5 + chin * Math.cos(t) * 0.5], 30, -90, 90), { w: 1.4, onBall: false });
  }
  if (layers.includes('jaw')) {
    for (const s of [1, -1]) curve([[s * SLICE, -0.69, 0], [s * 0.67, -0.86, 0.2], [s * 0.44, -1.04, 0.52], [s * 0.2, -1.12, 0.64], [0, -1.14, 0.68]], { w: 1.9, onBall: false });
  }
  if (layers.includes('ear')) {
    // The ear sits on the side plane between the brow line and the nose line, behind halfway.
    for (const s of [1, -1]) curve(circleOnBall((t) => [s * (SLICE + 0.01), -0.26 + 0.27 * Math.sin(t), -0.12 + 0.11 * Math.cos(t)], 24), { w: 1.3, onBall: false, closed: false });
  }
  // Features. Eyeballs are spheres one eyeball's width apart, the socket a trapezoid let into the
  // face, the nose a centre line with a trapezoid base, the mouth a curve wrapped round the muzzle.
  const onFace = (fx, fy, lift = 0) => { const z = Math.sqrt(Math.max(0, 1 - fx * fx - fy * fy)); return [fx, fy, z + lift]; };
  if (layers.includes('eyes')) {
    const eb = 0.135;
    for (const s of [-1, 1]) {
      // Socket: a trapezoid, wide at the brow.
      curve([onFace(s * 0.64, 0.04), onFace(s * 0.07, 0.04), onFace(s * 0.11, -0.27), onFace(s * 0.58, -0.24)], { w: 1.5, closed: true, onBall: false });
      const c = onFace(s * 0.3, -0.13, -0.07);
      // The eyeball and the two lids as curves on a small sphere at c.
      const eye = (lat, from, to, cls = 'd-ink', w = 1.8) => curve(circleOnBall((t) => [c[0] + eb * Math.cos(rad(lat)) * Math.sin(t), c[1] + eb * Math.sin(rad(lat)), c[2] + eb * Math.cos(rad(lat)) * Math.cos(t)], 24, from, to), { cls, w, onBall: false });
      const [ex, ey] = P(c);
      out.push(kit.circle(ex, ey, eb * r, { width: 1.5 }));
      eye(24, -78, 78, 'd-ink', 2);
      eye(-18, -78, 78, 'd-ink', 1.4);
    }
  }
  if (layers.includes('nose')) {
    curve([[0, -0.04, 1.0], [0, -0.26, 1.06], [0, -0.5, 1.1]], { w: 1.9, onBall: false });
    curve([[-0.08, -0.5, 1.07], [0.08, -0.5, 1.07], [0.2, -0.46, 0.96], [0.24, -0.5, 0.9], [-0.24, -0.5, 0.9], [-0.2, -0.46, 0.96], [-0.08, -0.5, 1.07]], { w: 1.5, onBall: false });
  }
  if (layers.includes('mouth')) {
    curve([[-0.32, -0.8, 0.74], [-0.17, -0.77, 0.87], [0, -0.78, 0.92], [0.17, -0.77, 0.87], [0.32, -0.8, 0.74]], { w: 2, onBall: false });
    curve([[-0.2, -0.88, 0.8], [0, -0.92, 0.86], [0.2, -0.88, 0.8]], { w: 1.5, onBall: false });
  }
  return out;
}
