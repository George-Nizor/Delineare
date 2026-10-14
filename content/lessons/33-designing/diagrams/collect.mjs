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

// Step 1: three different real animals to borrow from: a bird, a beetle and a horse, as quick sketches.
export default (L) => {
  const { svg, rect, ellipse, smooth, line, text, polyline } = L;
  const out = [rect(8, 8, 624, 246, { rx: 4 })];
  const panel = (i) => 24 + i * 204;
  [0, 1, 2].forEach((i) => out.push(rect(panel(i), 24, 188, 180, { cls: 'd-frame', stroke: 1.2 })));
  // heron
  { const ox = panel(0);
    out.push(ellipse(ox + 96, 118, 40, 22, { angle: -14, width: 2 }), smooth([[ox + 126, 108], [ox + 150, 86], [ox + 140, 62], [ox + 148, 44]], { width: 2.6 }), smooth([[ox + 134, 108], [ox + 160, 86], [ox + 148, 62], [ox + 156, 44]], { width: 2 }),
      ellipse(ox + 154, 40, 9, 6, { width: 2 }), polyline([[ox + 160, 38], [ox + 184, 42], [ox + 160, 44]], { width: 2 }), polyline([[ox + 92, 138], [ox + 96, 170], [ox + 86, 182]], { width: 2 }), polyline([[ox + 106, 138], [ox + 112, 170], [ox + 102, 182]], { width: 2 }), polyline([[ox + 58, 112], [ox + 36, 124]], { width: 2 })); }
  // beetle, seen from above
  { const ox = panel(1) + 94;
    out.push(ellipse(ox, 118, 38, 50, { width: 2 }), line(ox, 70, ox, 166, { width: 1.5 }), ellipse(ox, 66, 20, 14, { width: 2 }));
    [[-1, 96], [-1, 120], [-1, 144]].forEach(([s, y]) => out.push(polyline([[ox - 36, y], [ox - 64, y - 10], [ox - 78, y + 10]], { width: 2 }), polyline([[ox + 36, y], [ox + 64, y - 10], [ox + 78, y + 10]], { width: 2 })));
    out.push(polyline([[ox - 8, 56], [ox - 26, 38]], { width: 2 }), polyline([[ox + 8, 56], [ox + 26, 38]], { width: 2 })); }
  // horse
  { const ox = panel(2);
    out.push(ellipse(ox + 88, 112, 52, 26, { width: 2 }), line(ox + 120, 98, ox + 146, 60, { width: 2.2 }), line(ox + 132, 112, ox + 156, 76, { width: 2.2 }), ellipse(ox + 160, 62, 20, 8, { width: 2, angle: 52 }));
    [[56, 132, 52], [74, 136, 60], [108, 136, 60], [124, 130, 52]].forEach(([x, y, l], i) => out.push(polyline([[ox + x, y], [ox + x + (i % 2 ? 4 : -2), y + l * 0.55], [ox + x + (i % 2 ? -2 : 2), y + l]], { width: 2.2 })));
    out.push(smooth([[ox + 38, 100], [ox + 22, 118], [ox + 18, 150]], { width: 2.4 })); }
  ['bird', 'beetle', 'horse'].forEach((t, i) => out.push(text(panel(i) + 94, 232, t, { cls: 'd-label', anchor: 'middle', size: 14 })));
  return svg({ width: 640, height: 262 }, out);
};
