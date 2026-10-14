
// The usual mistake: wrinkles scattered over the cloth, beside folds that run out from the elbow.
export default ({ svg, rect, smooth, dot, tag, path, random }) => {
  const capsule = (a, b, r1, r2, n = 12) => {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); const pts = [];
    for (let i = 0; i <= n; i += 1) { const t = ang - Math.PI / 2 + (Math.PI * i) / n; pts.push([b[0] + r2 * Math.cos(t), b[1] + r2 * Math.sin(t)]); }
    for (let i = 0; i <= n; i += 1) { const t = ang + Math.PI / 2 + (Math.PI * i) / n; pts.push([a[0] + r1 * Math.cos(t), a[1] + r1 * Math.sin(t)]); }
    return pts;
  };
  const sleeve = (ox) => {
    const sh = [ox + 50, 70]; const el = [ox + 150, 120]; const wr = [ox + 96, 200];
    const draw = (a, b, r1, r2) => { const c = capsule(a, b, r1, r2); return [path(`M ${c.map((p) => p.join(' ')).join(' L ')} Z`, { cls: 'd-paper', width: 0 }), smooth(c.concat([c[0]]), { closed: true, width: 2.2 })]; };
    return { sh, el, wr, shapes: [draw(el, wr, 26, 20), draw(sh, el, 30, 26)] };
  };
  const next = random(4);
  const A = sleeve(14); const B = sleeve(294);
  const inside = (pt, sl) => { const d = (a, b) => { const vx = b[0] - a[0]; const vy = b[1] - a[1]; const t = Math.max(0, Math.min(1, ((pt[0] - a[0]) * vx + (pt[1] - a[1]) * vy) / (vx * vx + vy * vy))); return Math.hypot(pt[0] - a[0] - vx * t, pt[1] - a[1] - vy * t); }; return d(sl.sh, sl.el) < 20 || d(sl.el, sl.wr) < 15; };
  const scatter = [];
  while (scatter.length < 14) {
    const x = 40 + next() * 140; const y = 60 + next() * 140; const a = next() * Math.PI; const l = 8 + next() * 8;
    const p1 = [x, y]; const p2 = [x + Math.cos(a) * l, y + Math.sin(a) * l];
    if (inside(p1, A) && inside(p2, A)) scatter.push(smooth([p1, [(p1[0] + p2[0]) / 2 + 2, (p1[1] + p2[1]) / 2 - 2], p2], { cls: 'd-bad', width: 2 }));
  }
  const [x0, y0] = B.el;
  const folds = [[[0, 0], [-18, -8], [-38, -2]], [[0, 0], [-14, 8], [-28, 24]], [[0, 0], [-8, 16], [-10, 40]], [[0, 0], [-16, -2], [-34, -20]]].map((pts) => smooth(pts.map(([x, y]) => [x0 + x * 1.45, y0 + y * 1.45]), { width: 2 }));
  return svg({ width: 560, height: 236 }, rect(8, 8, 264, 220, { rx: 3 }), tag(140, 34, 'Folds with no start', { tone: 'bad' }), A.shapes, scatter,
    rect(288, 8, 264, 220, { rx: 3 }), tag(420, 34, 'Folds from the elbow'), B.shapes, folds, dot(x0, y0, { r: 5, cls: 'd-dot' }));
};
