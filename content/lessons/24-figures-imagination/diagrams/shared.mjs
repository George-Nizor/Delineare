// A 3D mannequin, projected to the page from real geometry, for this lesson's diagrams. Not a
// diagram itself. Units are head heights; y is up; at yaw 0 the figure faces the viewer (+z).
//
// The ribcage and pelvis are ellipsoids, so their outlines are the exact ellipses an ellipsoid
// casts. Limbs are tapered capsules between joints. The centre line is a real curve on the front
// of each ellipsoid, drawn only where it faces the viewer.

const rad = (d) => (d * Math.PI) / 180;
const mul = (A, B) => A.map((row, i) => B[0].map((_, j) => row.reduce((s, _, k) => s + A[i][k] * B[k][j], 0)));
const apply = (R, v) => R.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
const T = (A) => A[0].map((_, j) => A.map((row) => row[j]));
const norm = (v) => { const m = Math.hypot(...v) || 1; return v.map((c) => c / m); };
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
export const Rx = (a) => [[1, 0, 0], [0, Math.cos(rad(a)), -Math.sin(rad(a))], [0, Math.sin(rad(a)), Math.cos(rad(a))]];
export const Ry = (a) => [[Math.cos(rad(a)), 0, Math.sin(rad(a))], [0, 1, 0], [-Math.sin(rad(a)), 0, Math.cos(rad(a))]];
export const Rz = (a) => [[Math.cos(rad(a)), -Math.sin(rad(a)), 0], [Math.sin(rad(a)), Math.cos(rad(a)), 0], [0, 0, 1]];
// Orientation of a mass: lean forward (pitch), tilt sideways (roll), then turn about the vertical (twist).
export const orient = ({ pitch = 0, roll = 0, twist = 0 } = {}) => mul(Ry(twist), mul(Rz(roll), Rx(pitch)));

const RIB = [0.78, 0.82, 0.52];
const PEL = [0.72, 0.5, 0.46];

// Build the joints of a pose. Returns what the drawing needs, all in world space.
export function build(pose) {
  const Rr = orient(pose.rib);
  const Rp = orient(pose.pel);
  const rc = pose.rib.c;
  const pc = pose.pel.c;
  const sh = [-1, 1].map((s) => add(rc, apply(Rr, [s * 0.78, 0.5, 0])));
  const hip = [-1, 1].map((s) => add(pc, apply(Rp, [s * 0.4, -0.3, 0])));
  const arms = pose.arms.map((arm, i) => {
    const el = add(sh[i], norm(arm[0]), 1.4);
    const wr = add(el, norm(arm[1]), 1.15);
    return [sh[i], el, wr];
  });
  const legs = pose.legs.map((leg, i) => {
    const kn = add(hip[i], norm(leg[0]), 1.75);
    const an = add(kn, norm(leg[1]), 1.75);
    const toe = add(an, apply(Rp, [0, -0.15, 0.7]));
    return [hip[i], kn, an, toe];
  });
  const neck = add(rc, apply(Rr, [0, 0.95, 0]));
  const headC = add(rc, apply(Rr, [0, 1.75, 0.05]));
  const Rh = orient({ ...pose.rib, twist: (pose.rib.twist || 0) + (pose.headTurn || 0), pitch: (pose.rib.pitch || 0) + (pose.headPitch || 0) });
  return { Rr, Rp, rc, pc, sh, hip, arms, legs, neck, headC, Rh };
}

// The view: turn the world by `yaw` about the vertical, then look along -z.
const view = (yaw) => Ry(-yaw);

// Silhouette ellipse of an ellipsoid with semi-axes `a` turned by R, centred c.
function ellipsoid(kit, c, a, R, V, project, o) {
  const Q = mul(mul(R, [[a[0] ** 2, 0, 0], [0, a[1] ** 2, 0], [0, 0, a[2] ** 2]]), T(R));
  const Qv = mul(mul(V, Q), T(V));
  const [p, q, r] = [Qv[0][0], Qv[0][1], Qv[1][1]];
  const tr = p + r;
  const det = Math.sqrt(((p - r) / 2) ** 2 + q * q);
  const l1 = tr / 2 + det;
  const l2 = tr / 2 - det;
  const angle = (0.5 * Math.atan2(2 * q, p - r) * 180) / Math.PI;
  const [sx, sy] = project(c);
  return kit.ellipse(sx, sy, Math.sqrt(l1) * project.scale, Math.sqrt(Math.max(l2, 1e-4)) * project.scale, { ...o, angle: -angle });
}

// A curve on the front of an ellipsoid, x = 0 in its own frame, drawn where it faces the viewer.
function frontLine(kit, c, a, R, V, project, o, { from = -75, to = 75, side = 0 } = {}) {
  const runs = [];
  let run = [];
  for (let d = from; d <= to; d += 5) {
    const local = [side * a[0] * Math.cos(rad(d)), a[1] * Math.sin(rad(d)), a[2] * Math.cos(rad(d))];
    const world = add(c, apply(R, local));
    const normal = apply(V, apply(R, norm([local[0] / a[0] ** 2, local[1] / a[1] ** 2, local[2] / a[2] ** 2])));
    if (normal[2] > 0.04) run.push(project(world));
    else if (run.length) { runs.push(run); run = []; }
  }
  if (run.length) runs.push(run);
  return runs.filter((r) => r.length > 2).map((r) => kit.smooth(r, o));
}

// A great circle round the head (the brow line), front half only.
function ring(kit, c, r, R, V, project, o, tiltDeg = 0) {
  const run = [];
  for (let d = -90; d <= 90; d += 6) {
    const local = [r * Math.sin(rad(d)), r * Math.sin(rad(tiltDeg)) * Math.cos(rad(d)), r * Math.cos(rad(d))];
    const normal = apply(V, apply(R, norm(local)));
    if (normal[2] > -0.02) run.push(project(add(c, apply(R, local))));
  }
  return run.length > 2 ? kit.smooth(run, o) : '';
}

function capsule(kit, [x1, y1], [x2, y2], r1, r2, opts) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const p = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  return kit.path(`M ${p(x1 + nx * r1, y1 + ny * r1)} L ${p(x2 + nx * r2, y2 + ny * r2)} A ${r2} ${r2} 0 0 0 ${p(x2 - nx * r2, y2 - ny * r2)} L ${p(x1 - nx * r1, y1 - ny * r1)} A ${r1} ${r1} 0 0 0 ${p(x1 + nx * r1, y1 + ny * r1)} Z`, opts);
}

// Draw a mannequin. `at` is where the floor point under the origin goes on the page; `s` is the
// page size of one head height. `parts` can leave out limbs, head or the guide lines.
export function mannequin(kit, pose, yaw, { x, floor, s, parts = ['torso', 'head', 'limbs', 'centre'], width = 1.8, tone = 'ink' } = {}) {
  const J = build(pose);
  const V = view(yaw);
  const project = (p) => { const v = apply(V, p); return [x + v[0] * s, floor - v[1] * s]; };
  project.scale = s;
  const depth = (p) => apply(V, p)[2];
  const near = (z) => (tone === 'ink' && z > -0.05 ? 'd-ink' : 'd-guide');
  const out = [];
  if (parts.includes('limbs')) {
    const segs = [];
    J.arms.forEach((a) => { segs.push([a[0], a[1], 0.22, 0.17], [a[1], a[2], 0.17, 0.12]); });
    J.legs.forEach((l) => { segs.push([l[0], l[1], 0.33, 0.22], [l[1], l[2], 0.22, 0.13], [l[2], l[3], 0.13, 0.1]); });
    segs.sort((p, q) => depth(add(p[0], p[1])) - depth(add(q[0], q[1])));
    for (const [a, b, r1, r2] of segs) out.push(capsule(kit, project(a), project(b), r1 * s, r2 * s, { cls: near(depth(add(a, b, 1) ) / 2), width: width - 0.3 }));
  }
  if (parts.includes('torso')) {
    const tcls = tone === 'ink' ? 'd-ink' : 'd-guide';
    out.push(ellipsoid(kit, J.pc, PEL, J.Rp, V, project, { cls: tcls, width }));
    out.push(ellipsoid(kit, J.rc, RIB, J.Rr, V, project, { cls: tcls, width }));
  }
  if (parts.includes('centre')) {
    // One smooth curve down the front of the ribcage and on through the pelvis.
    const o = { cls: 'd-mark', width: 2.4 };
    const pts = [];
    for (const [c, a, R] of [[J.rc, RIB, J.Rr], [J.pc, PEL, J.Rp]]) {
      for (let d = 72; d >= -72; d -= 6) {
        const local = [0, a[1] * Math.sin(rad(d)), a[2] * Math.cos(rad(d))];
        const normal = apply(V, apply(R, norm([0, local[1] / a[1] ** 2, local[2] / a[2] ** 2])));
        if (normal[2] > 0.04) pts.push(project(add(c, apply(R, local))));
      }
    }
    if (pts.length > 2) out.push(kit.smooth(pts, o));
  }
  if (parts.includes('head')) {
    const [hx, hy] = project(J.headC);
    out.push(kit.circle(hx, hy, 0.5 * s, { width, cls: tone === 'ink' ? 'd-ink' : 'd-guide' }));
    out.push(kit.line(...project(J.neck), hx, hy + 0.45 * s, { width: width - 0.2, cls: tone === 'ink' ? 'd-ink' : 'd-guide' }));
    if (parts.includes('centre')) {
      out.push(frontLine(kit, J.headC, [0.5, 0.5, 0.5], J.Rh, V, project, { cls: 'd-mark', width: 1.8 }, { from: -80, to: 80 }));
      out.push(ring(kit, J.headC, 0.5, J.Rh, V, project, { cls: 'd-mark', width: 1.8 }));
    }
  }
  return out;
}

// Where the head, ribcage, pelvis and ankles land on the page, for lines drawn over a figure.
export function keyPoints(pose, yaw, { x, floor, s }) {
  const J = build(pose);
  const V = view(yaw);
  const project = (p) => { const v = apply(V, p); return [x + v[0] * s, floor - v[1] * s]; };
  return { head: project(J.headC), rib: project(J.rc), pel: project(J.pc), ankles: J.legs.map((l) => project(l[2])), hips: J.hip.map(project), shoulders: J.sh.map(project), wrists: J.arms.map((a) => project(a[2])), knees: J.legs.map((l) => project(l[1])), elbows: J.arms.map((a) => project(a[1])) };
}

// Ready-made poses.
export const POSES = {
  stand: {
    pel: { c: [0, 3.95, 0], roll: 0, twist: 0 }, rib: { c: [0, 5.3, 0], roll: 0, twist: 0 },
    arms: [[[-0.1, -1, 0], [0, -1, 0.1]], [[0.1, -1, 0], [0, -1, 0.1]]],
    legs: [[[-0.03, -1, 0], [0, -1, 0]], [[0.03, -1, 0], [0, -1, 0]]],
  },
  reach: {
    pel: { c: [-0.05, 3.95, 0], roll: 6, twist: -14 }, rib: { c: [0.25, 5.3, 0], roll: -12, twist: 20, pitch: -3 }, headTurn: -14,
    arms: [[[-0.1, -0.9, 0.5], [0.1, -0.7, 0.8]], [[0.35, 0.95, 0.15], [0, 1, 0.2]]],
    legs: [[[-0.03, -1, 0.02], [0, -1, 0]], [[0.15, -0.9, 0.55], [0.05, -1, -0.45]]],
  },
  bend: {
    pel: { c: [0, 3.9, -0.1], roll: 0, twist: 18, pitch: 10 }, rib: { c: [0.1, 5.1, 0.35], roll: 4, twist: -8, pitch: 38 }, headTurn: -10, headPitch: 15,
    arms: [[[-0.1, -0.7, 0.8], [0, -0.8, 0.7]], [[0.2, -0.6, 0.9], [0.1, -0.9, 0.6]]],
    legs: [[[-0.04, -1, 0.1], [0, -1, -0.1]], [[0.08, -1, 0.15], [0, -1, -0.15]]],
  },
  throw: {
    pel: { c: [0, 3.8, 0.1], roll: -3, twist: 22 }, rib: { c: [-0.15, 5.2, -0.1], roll: 8, twist: -38, pitch: -10 }, headTurn: 35,
    arms: [[[-0.2, -0.1, 1], [0.1, 0, 1]], [[0.9, 0.2, -0.5], [0.4, 1, -0.3]]],
    legs: [[[-0.15, -0.85, 0.55], [0, -1, -0.5]], [[0.25, -1, -0.45], [0.1, -1, -0.1]]],
  },
};

// Project world points for lines drawn over a figure, with the same view as `mannequin`.
export function projector(yaw, { x, floor, s }) {
  const V = view(yaw);
  return (p) => { const v = apply(V, p); return [x + v[0] * s, floor - v[1] * s]; };
}
