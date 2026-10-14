// An invented creature: a horse's body and tail, a beetle's shell, a heron's neck, beak and legs.
// Three views are described point by point. Kept in this file on purpose.
function capsule(a, b, r1, r2, n = 10) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); const pts = [];
  for (let i = 0; i <= n; i += 1) { const t = ang - Math.PI / 2 + (Math.PI * i) / n; pts.push([b[0] + r2 * Math.cos(t), b[1] + r2 * Math.sin(t)]); }
  for (let i = 0; i <= n; i += 1) { const t = ang + Math.PI / 2 + (Math.PI * i) / n; pts.push([a[0] + r1 * Math.cos(t), a[1] + r1 * Math.sin(t)]); }
  return pts;
}
const VIEWS = {
  side: { body: [0, 118, 62, 36, 0], neck: [[44, 100], [84, 36]], head: [95, 31, 11, 7, 0], beak: [[104, 28], [130, 34], [104, 36]], tail: [[-58, 118], [-90, 162]], nearLegs: [[[34, 148], [40, 176], [32, 200]], [[-32, 148], [-26, 176], [-38, 200]]], farLegs: [[[48, 148], [54, 176], [46, 200]], [[-18, 148], [-12, 176], [-24, 200]]] },
  three: { body: [0, 118, 52, 36, -6], neck: [[28, 100], [48, 36]], head: [54, 31, 10, 8, 0], beak: [[60, 28], [80, 38], [60, 36]], tail: [[-46, 118], [-66, 160]], nearLegs: [[[30, 148], [36, 176], [28, 200]], [[-30, 148], [-34, 176], [-40, 200]]], farLegs: [[[-4, 150], [-2, 176], [-10, 200]], [[-48, 148], [-52, 176], [-58, 200]]] },
  front: { body: [0, 118, 40, 36, 0], neck: [[0, 100], [0, 38]], head: [0, 31, 9, 9, 0], beak: null, tail: null, nearLegs: [[[24, 148], [30, 176], [26, 200]], [[-24, 148], [-30, 176], [-26, 200]]], farLegs: [] },
};
function creature(L, { view = 'side', ox = 0, oy = 0, s = 1, mode = 'forms', neck = 1, shell = true, legs = 1, tail = true, body = 1, cls = 'd-ink', guide = 'd-guide', width = 2, joints = false } = {}) {
  const { smooth, ellipse, path, line, dot } = L;
  const V = VIEWS[view];
  const X = (x) => ox + s * x; const Y = (y) => oy + s * (y - 200);
  const P = (p) => [X(p[0]), Y(p[1])];
  const solid = mode === 'sil';
  const out = [];
  const leg = (j) => { const k = legs; const hip = [j[0][0], j[0][1]]; const kn = [j[1][0], 148 + (j[1][1] - 148) * k]; const an = [j[2][0], 148 + (j[2][1] - 148) * k]; return [hip, kn, an]; };
  const cap = (a, b, r1, r2, c = cls, w = width) => { const pts = capsule(a, b, r1, r2).map(P); return solid ? path(`M ${pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L ')} Z`, { cls: 'd-fill', width: 0 }) : smooth(pts.concat([pts[0]]), { cls: c, width: w, closed: true }); };
  const ell = (cx, cy, rx, ry, ang, c = cls, w = width) => solid ? ellipse(X(cx), Y(cy), rx * s, ry * s, { cls: 'd-fill', angle: ang, width: 0 }) : ellipse(X(cx), Y(cy), rx * s, ry * s, { cls: c, width: w, angle: ang });
  const drawLeg = (j, c, w) => { const [a, b, d] = leg(j); const foot = view === 'front' ? [d[0] + 3, d[1] + 3] : [d[0] + 12, d[1] + 3]; return [cap(a, b, 8, 5.5, c, w), cap(b, d, 5.5, 3.6, c, w), cap(d, foot, 3.6, 3, c, w)]; };
  const bodyV = [V.body[0], V.body[1] - (body - 1) * 10, V.body[2] * body, V.body[3] * body, V.body[4]];
  V.farLegs.forEach((j) => out.push(drawLeg(j, guide, width - 0.5)));
  if (tail && V.tail) out.push(cap(V.tail[0], V.tail[1], 7, 2.5));
  out.push(ell(...bodyV));
  if (shell) {
    const [cx, cy, rx, ry] = bodyV;
    out.push(solid ? ell(cx, cy - 12, rx * 0.95, ry + 8, 0) : [path(`M ${X(cx - rx * 0.95)} ${Y(cy - 4)} A ${rx * 0.95 * s} ${(ry + 8) * s} 0 0 1 ${X(cx + rx * 0.95)} ${Y(cy - 4)}`, { cls, width }), line(X(cx), Y(cy - ry - 18), X(cx), Y(cy - 8), { cls: guide, width: 1.4 })]);
  }
  V.nearLegs.forEach((j) => out.push(drawLeg(j, cls, width)));
  const nk = [[V.neck[0][0], V.neck[0][1]], [V.neck[0][0] + (V.neck[1][0] - V.neck[0][0]) * neck, V.neck[0][1] + (V.neck[1][1] - V.neck[0][1]) * neck]];
  out.push(cap(nk[0], nk[1], 11, 7));
  const hd = [V.head[0] + (nk[1][0] - V.neck[1][0]), V.head[1] + (nk[1][1] - V.neck[1][1]), V.head[2], V.head[3], V.head[4]];
  out.push(ell(...hd));
  if (V.beak) { const dx = nk[1][0] - V.neck[1][0]; const dy = nk[1][1] - V.neck[1][1]; const b = V.beak.map(([x, y]) => [x + dx, y + dy]); out.push(solid ? path(`M ${b.map((p) => P(p).join(' ')).join(' L ')} Z`, { cls: 'd-fill', width: 0 }) : smooth([b[0], b[1], b[2]].map(P), { cls, width: width - 0.4 })); }
  if (joints) [...V.nearLegs.flatMap((j) => leg(j)), nk[0], nk[1]].forEach((p) => out.push(dot(X(p[0]), Y(p[1]), { r: 3.2, cls: 'd-dot' })));
  return out;
}

// Step 2: one part from each animal, drawn small: the bird's neck and leg, the beetle's shell, the horse's body and tail.
export default (L) => {
  const { svg, rect, ellipse, smooth, line, text, polyline, path, dot } = L;
  const out = [rect(8, 8, 624, 246, { rx: 4 })];
  const panel = (i) => 24 + i * 204;
  [0, 1, 2].forEach((i) => out.push(rect(panel(i), 24, 188, 180, { cls: 'd-frame', stroke: 1.2 })));
  { const ox = panel(0);
    out.push(smooth([[ox + 60, 188], [ox + 54, 150], [ox + 80, 118], [ox + 66, 88], [ox + 92, 56]], { width: 2.6 }), smooth([[ox + 82, 188], [ox + 78, 150], [ox + 100, 118], [ox + 86, 88], [ox + 108, 56]], { width: 2 }),
      polyline([[ox + 138, 120], [ox + 146, 150], [ox + 130, 178], [ox + 148, 186]], { width: 2.4 }), dot(ox + 138, 120), dot(ox + 146, 150), dot(ox + 130, 178)); }
  { const ox = panel(1) + 94;
    out.push(path(`M ${ox - 64} 160 A 64 80 0 0 1 ${ox + 64} 160 Z`, { width: 2.2 }), line(ox, 80, ox, 160, { width: 1.6 }), smooth([[ox - 40, 150], [ox - 30, 118], [ox - 14, 92]], { width: 1.4, cls: 'd-guide' }), smooth([[ox + 40, 150], [ox + 30, 118], [ox + 14, 92]], { width: 1.4, cls: 'd-guide' })); }
  { const ox = panel(2);
    out.push(ellipse(ox + 98, 110, 64, 36, { width: 2.2 }), smooth([[ox + 34, 100], [ox + 18, 130], [ox + 12, 176]], { width: 2.6 }), smooth([[ox + 38, 106], [ox + 26, 134], [ox + 24, 170]], { width: 1.6 }), ellipse(ox + 100, 112, 22, 28, { cls: 'd-guide', width: 1.4 }), ellipse(ox + 150, 120, 14, 22, { cls: 'd-guide', width: 1.4, angle: 18 })); }
  ['bird: neck and leg', 'beetle: shell', 'horse: body and tail'].forEach((t, i) => out.push(text(panel(i) + 94, 232, t, { cls: 'd-label', anchor: 'middle', size: 14 })));
  return svg({ width: 640, height: 262 }, out);
};
