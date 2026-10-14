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
// Tone is judged against a neutral grey in both themes, so this diagram uses fixed greys and never
// follows the light or dark theme. Every theme class is turned into a fixed inline style.
function fixed(markup) {
  const STYLE = {
    'd-ink': 'stroke:#161616', 'd-guide': 'stroke:#8c8c8c', 'd-bad': 'stroke:#a2482a', 'd-dot': 'fill:#161616',
    'd-frame': 'fill:none;stroke:#161616', 'd-fill': 'fill:#161616;stroke:none', 'd-fill-soft': 'fill:#9a9a9a;stroke:none',
    'd-label': 'fill:#3a3a3a', 'd-tag': 'fill:#5a6000', 'd-tag-bad': 'fill:#a2482a', 'd-mark': 'stroke:#5a6000',
  };
  const order = ['d-ink', 'd-guide', 'd-bad', 'd-dot', 'd-frame', 'd-fill', 'd-fill-soft', 'd-label', 'd-tag', 'd-tag-bad', 'd-mark'];
  return markup.replace(/<(rect|path|line|circle|ellipse|text)([^>]*?) class="([^"]*)"/g, (whole, tag, attrs, classes) => {
    const tokens = classes.split(/\s+/);
    const parts = [];
    if (tokens.includes('d-paper')) parts.push(tag === 'rect' ? 'fill:#b4b4b4;stroke:#8a8a8a' : 'fill:#f4f4f4');
    order.forEach((t) => { if (tokens.includes(t)) parts.push(STYLE[t]); });
    return `<${tag}${attrs} style="${parts.join(';')}"`;
  }).replace('class="diagram-svg"', 'class="diagram-svg"');
}

// A finished page: a fork, a leaf in three positions, a spray in profile and a tree as a mass.
const body = (L) => {
  const { svg, rect, smooth, line, ellipse, path } = L;
  const out = [rect(6, 6, 588, 388, { rx: 4 })];
  // fork, top left
  const F = [110, 150]; const TL = [56, 62]; const TR = [168, 70]; const B = [108, 226];
  const fk = fork(F, TL, TR, B, 15, 13, 12, 7);
  out.push(smooth(fk.outline.concat([fk.outline[0]]), { width: 2, closed: true }));
  fk.limbs.forEach((limb, k) => fk.sides[k].hi.slice(1, -1).forEach((p, i) => { const c = mix(p, fk.sides[k].lo[i + 1], 0.38); out.push(line(p[0], p[1], c[0] - limb.d[0] * 4, c[1] - limb.d[1] * 4, { width: 1 })); }));
  // leaf in three positions, top middle
  [[0.3, 232], [0.62, 270], [1, 316]].forEach(([k, x]) => { const lf = leaf(x, 40, 120 * k, 30, 90); out.push(smooth(lf.outline.concat([lf.outline[0]]), { closed: true, width: 1.8 }), smooth(lf.mid, { width: 1.3 })); });
  // spray in profile, top right
  out.push(spray(L, 380, 190, 0.7, 2));
  // tree mass, bottom
  const cx = 150; const cy = 310;
  const outer = Array.from({ length: 36 }, (_, i) => { const t = (i / 36) * Math.PI * 2; const bump = 1 + 0.07 * Math.sin(t * 5) + 0.05 * Math.cos(t * 3); return [cx + 110 * bump * Math.cos(t), cy + 52 * bump * Math.sin(t)]; });
  out.push(smooth(outer, { cls: 'd-guide', width: 1.6, closed: true, dash: '4 4' }), trunkShape(L, 151, 340, 386, 5, 11));
  [[-70, -14], [-34, -44], [2, -50], [38, -40], [74, -12]].forEach(([dx, dy]) => out.push(smooth([[151, 342], [151 + dx * 0.5, 342 + dy * 0.6 - 4], [151 + dx, 310 + dy * 0.5]], { width: 1.8 })));
  // second tree
  const outer2 = outer.map(([x, y]) => [x + 290, y - 4]);
  out.push(smooth(outer2, { cls: 'd-guide', width: 1.6, closed: true, dash: '4 4' }), trunkShape(L, 441, 340, 386, 5, 11));
  [[-70, -14], [-34, -44], [2, -50], [38, -40], [74, -12]].forEach(([dx, dy]) => out.push(smooth([[441, 342], [441 + dx * 0.5, 342 + dy * 0.6 - 4], [441 + dx, 310 + dy * 0.5]], { width: 1.8 })));
  return svg({ width: 600, height: 400 }, out);
};
export default (L) => fixed(body(L));
