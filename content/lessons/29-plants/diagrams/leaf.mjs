// Helpers for this lesson's plant diagrams (kept in this file on purpose).
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const unit = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const norm = (v) => [-v[1], v[0]];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const cross2 = (a, b) => a[0] * b[1] - a[1] * b[0];
function meet(p, d, q, e) { const t = cross2(sub(q, p), e) / cross2(d, e); return add(p, d, t); }
// A pointed leaf: outline points and midrib. (x, y) is the base, `ang` the direction of the tip in degrees.
function leaf(x, y, len, wid, ang = -90, { bend = 0 } = {}) {
  const a = (ang * Math.PI) / 180; const ux = Math.cos(a); const uy = Math.sin(a);
  const place = (t, s) => { const bendOff = bend * Math.sin(t * Math.PI) * len; return [x + ux * len * t - uy * (s + bendOff), y + uy * len * t + ux * (s + bendOff)]; };
  const hw = (t) => (wid / 2) * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.9);
  const side = (sign) => Array.from({ length: 21 }, (_, i) => place(i / 20, sign * hw(i / 20)));
  const up = side(1); const down = side(-1).reverse();
  return { outline: [...up, ...down], mid: Array.from({ length: 11 }, (_, i) => place(i / 10, 0)), place };
}
// A limb between two points, as outline edges (left and right of the axis).
function limbEdges(a, b, r1, r2, n = 8) {
  const d = unit(sub(b, a)); const nn = norm(d);
  const left = Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return add(mix(a, b, t), nn, mix([r1, 0], [r2, 0], t)[0]); });
  const right = Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return add(mix(a, b, t), nn, -mix([r1, 0], [r2, 0], t)[0]); });
  return { left, right, d, n: nn };
}
const poly = (pts) => `M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} Z`;
// A leafy spray in black profile. detail 2: separate leaves on stalks. 1: stalks gone, leaves run
// together. 0: a few dark patches. (ox, oy) is the stem's base, `s` the scale.
function spray(L, ox, oy, s, detail = 2) {
  const { path, smooth, ellipse, random } = L;
  const next = random(21);
  const stem = (u) => [ox + s * (u * 250), oy - s * (u * 170 + 40 * Math.sin(u * 2.4))];
  const out = [];
  if (detail === 0) {
    [[0.35, 0, 38, 26], [0.62, 0.1, 52, 34], [0.9, -0.1, 44, 30]].forEach(([u, dv, rx, ry]) => { const p = stem(u); out.push(ellipse(p[0], p[1] + dv * 60 * s, rx * s, ry * s, { cls: 'd-fill-soft', angle: -26 })); });
    return out;
  }
  if (detail === 2) out.push(smooth(Array.from({ length: 16 }, (_, i) => stem(i / 15)), { width: Math.max(1.4, 3 * s) }));
  const leaves = [];
  for (let k = 0; k < 14; k += 1) {
    const u = 0.14 + (k / 14) * 0.86; const side = k % 2 ? 1 : -1; const p = stem(u);
    const q = stem(u + 0.03); const stemAng = Math.atan2(q[1] - p[1], q[0] - p[0]);
    const ang = ((stemAng + side * (0.75 + next() * 0.4)) * 180) / Math.PI;
    const len = s * (84 - 26 * u + next() * 14) * (detail === 1 ? 1.25 : 1); const wid = s * (26 + next() * 6) * (detail === 1 ? 1.5 : 1);
    leaves.push(leaf(p[0], p[1], len, wid, ang, { bend: side * 0.05 }));
    if (detail === 2) { const base = leaf(p[0], p[1], len, wid, ang, { bend: side * 0.05 }); out.push(smooth([p, base.place(0.08, 0)], { width: Math.max(1.2, 2 * s) })); }
  }
  leaves.forEach((lf) => out.push(path(poly(lf.outline), { cls: 'd-fill', width: 0 })));
  return out;
}
// A trunk with a paper fill and an ink outline.
function trunkShape(L, x, top, bottom, wTop, wBottom) {
  const { path } = L;
  const d = `M ${x - wBottom} ${bottom} Q ${x - (wBottom + wTop) / 2 - 2} ${(top + bottom) / 2} ${x - wTop} ${top} L ${x + wTop} ${top} Q ${x + (wBottom + wTop) / 2 + 2} ${(top + bottom) / 2} ${x + wBottom} ${bottom} Z`;
  return [path(d, { cls: 'd-paper', width: 0 }), path(d, { cls: 'd-ink', width: 2.2 })];
}
// The outline of a forked branch and the limbs it is made of.
function fork(F, TL, TR, B, rT0, rT1, r0, r1) {
  const tk = limbEdges(B, F, rT0, rT1); const lb = limbEdges(F, TL, r0, r1); const rb = limbEdges(F, TR, r0 - 1, r1 - 1);
  const sides = (limb) => { const m = Math.floor(limb.left.length / 2); return limb.left[m][0] < limb.right[m][0] ? { lo: limb.left, hi: limb.right } : { lo: limb.right, hi: limb.left }; };
  const t = sides(tk); const l = sides(lb); const r = sides(rb);
  const crotch = meet(l.hi[0], lb.d, r.lo[0], rb.d);
  const outline = [...t.lo.slice(0, 8), ...l.lo.slice(1), ...l.hi.slice(2).reverse(), crotch, ...r.lo.slice(2), ...r.hi.slice(1).reverse(), ...t.hi.slice(0, 8).reverse()];
  return { outline, limbs: [tk, lb, rb], sides: [t, l, r] };
}

// One long leaf in four positions, from edge-on to full length, with its midrib and a flow arrow.
export default (L) => {
  const { svg, rect, smooth, line, arcArrow, text } = L;
  const tilts = [[0.12, 'edge on'], [0.45, ''], [0.75, ''], [1, 'full length']];
  const out = [];
  tilts.forEach(([k, label], i) => {
    const x = 50 + i * 100; const len = 190 * k; const lf = leaf(x, 40, len, 48, 90);
    out.push(smooth(lf.outline.concat([lf.outline[0]]), { closed: true, width: 2 }), smooth(lf.mid, { width: 1.5 }));
    if (k > 0.4) out.push(arcArrow(x + 12, 64, x + 12, 40 + len * 0.7, { lift: 10, width: 1.6 }));
    if (label) out.push(text(x, 270, label, { cls: 'd-label', anchor: 'middle', size: 14 }));
  });
  return svg({ width: 440, height: 292 }, rect(6, 6, 428, 280, { rx: 4 }), out);
};
