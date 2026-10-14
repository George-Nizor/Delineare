// ---- helpers shared by this lesson's diagrams (kept in each file so every diagram stands alone)
const f2 = (v) => Number(v.toFixed(2));
function helpers(L) {
  const { path, line, text } = L;
  const d = (pts, close) => `M ${pts.map(([x, y]) => `${f2(x)} ${f2(y)}`).join(' L ')}${close ? ' Z' : ''}`;
  const poly = (pts, { close = false, ...o } = {}) => path(d(pts, close), o);
  const tint = (pts, { color = 'var(--d-mark)', opacity = 0.18 } = {}) => `<path d="${d(pts, true)}" fill="${color}" fill-opacity="${opacity}" stroke="none"/>`;
  const solid = (pts) => `<path d="${d(pts, true)}" fill="var(--d-paper)" stroke="none"/>`;
  const rot = (pts, deg, cx, cy) => pts.map(([x, y]) => {
    const a = (deg * Math.PI) / 180; const dx = x - cx; const dy = y - cy;
    return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
  });
  // A measuring bracket between two points with end ticks and a label beside its middle.
  const dim = (x1, y1, x2, y2, label, { cls = 'd-mark', side = 1, tick = 6, size = 13, gap = 14, anchor } = {}) => {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1; const nx = (-(y2 - y1) / len) * side; const ny = ((x2 - x1) / len) * side;
    const out = [line(x1, y1, x2, y2, { cls, width: 1.8 }), line(x1 - nx * tick, y1 - ny * tick, x1 + nx * tick, y1 + ny * tick, { cls, width: 1.8 }), line(x2 - nx * tick, y2 - ny * tick, x2 + nx * tick, y2 + ny * tick, { cls, width: 1.8 })];
    if (label) out.push(text((x1 + x2) / 2 + nx * (tick + gap), (y1 + y2) / 2 + ny * (tick + gap) + 4, label, { anchor: anchor || (Math.abs(nx) > 0.5 ? (nx > 0 ? 'start' : 'end') : 'middle'), size }));
    return out;
  };
  // A pencil lying along angle `deg` from its tip at (x, y).
  const pencil = (x, y, len, deg, { cls = 'd-ink' } = {}) => {
    const body = [[0, 0], [16, -4.5], [len, -4.5], [len, 4.5], [16, 4.5]];
    const pts = rot(body.map(([px, py]) => [x + px, y + py]), deg, x, y);
    return [poly(pts, { close: true, cls, width: 1.8 }), poly(rot([[x + 16, y - 4.5], [x + 16, y + 4.5]], deg, x, y), { cls, width: 1.2 })];
  };
  // A mug, front view: body from (x, y) of width w and height h, rim ellipse on top, handle on the right.
  const mug = (x, y, w, h, { cls = 'd-ink', width = 2.2, handle = true, hy = [0.26, 0.7], rim = 0.15 } = {}) => {
    const ry = w * rim; const cx = x + w / 2;
    const out = [
      L.ellipse(cx, y + ry, w / 2, ry, { cls, width }),
      line(x, y + ry, x, y + h - ry, { cls, width }), line(x + w, y + ry, x + w, y + h - ry, { cls, width }),
      path(`M ${f2(x)} ${f2(y + h - ry)} A ${f2(w / 2)} ${f2(ry)} 0 0 0 ${f2(x + w)} ${f2(y + h - ry)}`, { cls, width }),
    ];
    if (handle) out.push(path(`M ${f2(x + w)} ${f2(y + h * hy[0])} C ${f2(x + w * 1.5)} ${f2(y + h * (hy[0] - 0.06))} ${f2(x + w * 1.5)} ${f2(y + h * (hy[1] + 0.02))} ${f2(x + w)} ${f2(y + h * hy[1])}`, { cls, width }));
    return out;
  };
  // A plain chair, front view, in a box w by h with its top-left at (x, y).
  const chairParts = (x, y, w, h) => {
    const X = (v) => x + v * w; const Y = (v) => y + v * h;
    return {
      rail: [[X(0.1), Y(0)], [X(0.9), Y(0)], [X(0.9), Y(0.07)], [X(0.1), Y(0.07)]],
      slats: [0.2, 0.4, 0.6, 0.8].map((c) => [[X(c - 0.025), Y(0.07)], [X(c + 0.025), Y(0.07)], [X(c + 0.025), Y(0.46)], [X(c - 0.025), Y(0.46)]]),
      seat: [[X(0), Y(0.46)], [X(1), Y(0.46)], [X(1), Y(0.54)], [X(0), Y(0.54)]],
      legs: [0.08, 0.86].map((c) => [[X(c), Y(0.54)], [X(c + 0.06), Y(0.54)], [X(c + 0.06), Y(1)], [X(c), Y(1)]]),
      stretcher: [[X(0.14), Y(0.8)], [X(0.86), Y(0.8)], [X(0.86), Y(0.85)], [X(0.14), Y(0.85)]],
      gaps: [
        [[X(0.14), Y(0.54)], [X(0.86), Y(0.54)], [X(0.86), Y(0.8)], [X(0.14), Y(0.8)]],
        [[X(0.14), Y(0.85)], [X(0.86), Y(0.85)], [X(0.86), Y(1)], [X(0.14), Y(1)]],
        ...[0.3, 0.5, 0.7].map((c) => [[X(c - 0.075), Y(0.07)], [X(c + 0.075), Y(0.07)], [X(c + 0.075), Y(0.46)], [X(c - 0.075), Y(0.46)]]),
      ],
      envelope: [[X(0.1), Y(0)], [X(0.9), Y(0)], [X(1), Y(0.46)], [X(1), Y(0.54)], [X(0.92), Y(1)], [X(0.08), Y(1)], [X(0), Y(0.54)], [X(0), Y(0.46)]],
    };
  };
  const chair = (x, y, w, h, { cls = 'd-ink', width = 2 } = {}) => {
    const c = chairParts(x, y, w, h);
    return [c.rail, ...c.slats, c.seat, ...c.legs, c.stretcher].map((p) => poly(p, { close: true, cls, width }));
  };
  const eye = (x, y, { r = 11 } = {}) => [L.ellipse(x, y, r, r * 0.55, {}), `<circle cx="${x}" cy="${y}" r="${r * 0.32}" class="d-dot"/>`];
  return { d, poly, tint, solid, rot, dim, pencil, mug, chairParts, chair, eye };
}

// ---- a figure built from joint positions (unit coordinates, y down), for the gesture diagrams
const POSES = {
  walk: { head: [0.52, 0.07], neck: [0.5, 0.14], chest: [0.49, 0.245], pelvis: [0.47, 0.4], ls: [0.4, 0.185], rs: [0.58, 0.145], lh: [0.4, 0.385], rh: [0.54, 0.415], lk: [0.37, 0.59], lf: [0.26, 0.8], rk: [0.56, 0.6], rf: [0.55, 0.84], le: [0.33, 0.29], lhand: [0.27, 0.41], re: [0.66, 0.27], rhand: [0.71, 0.4], weight: 'r' },
  lean: { head: [0.6, 0.075], neck: [0.57, 0.14], chest: [0.53, 0.25], pelvis: [0.44, 0.4], ls: [0.46, 0.2], rs: [0.65, 0.165], lh: [0.37, 0.385], rh: [0.52, 0.42], lk: [0.42, 0.6], lf: [0.37, 0.84], rk: [0.5, 0.62], rf: [0.55, 0.84], le: [0.4, 0.31], lhand: [0.44, 0.45], re: [0.74, 0.24], rhand: [0.8, 0.1], weight: 'l' },
  throw: { head: [0.42, 0.08], neck: [0.44, 0.15], chest: [0.47, 0.25], pelvis: [0.5, 0.4], ls: [0.37, 0.185], rs: [0.55, 0.22], lh: [0.43, 0.41], rh: [0.58, 0.385], lk: [0.4, 0.6], lf: [0.3, 0.82], rk: [0.66, 0.58], rf: [0.8, 0.8], le: [0.27, 0.12], lhand: [0.22, 0.02], re: [0.62, 0.34], rhand: [0.55, 0.45], weight: 'l' },
  bend: { head: [0.3, 0.3], neck: [0.37, 0.3], chest: [0.47, 0.3], pelvis: [0.62, 0.4], ls: [0.4, 0.26], rs: [0.42, 0.35], lh: [0.6, 0.37], rh: [0.65, 0.43], lk: [0.6, 0.62], lf: [0.58, 0.84], rk: [0.7, 0.62], rf: [0.7, 0.84], le: [0.36, 0.45], lhand: [0.34, 0.6], re: [0.4, 0.5], rhand: [0.38, 0.63], weight: 'l' },
};
function figure(L, pose, ox, oy, S) {
  const { smooth, path, ellipse } = L;
  const P = (k) => [ox + pose[k][0] * S, oy + pose[k][1] * S];
  const w = pose.weight === 'l' ? ['lk', 'lf'] : ['rk', 'rf'];
  const action = () => smooth([P('neck'), P('chest'), P('pelvis'), P(w[0]), P(w[1])], { cls: 'd-mark', width: 3.6 });
  const head = (o = {}) => ellipse(...P('head'), S * 0.052, S * 0.062, { angle: 12, width: 2.2, ...o });
  const limb = (a, b, c, o = {}) => smooth([P(a), P(b), P(c)], { width: 2.8, ...o });
  const torso = (o = {}) => {
    const side = (a, b, bow) => { const A = P(a); const B = P(b); return smooth([A, [(A[0] + B[0]) / 2 + bow, (A[1] + B[1]) / 2], B], { width: 2.8, ...o }); };
    return [side('ls', 'lh', -S * 0.012), side('rs', 'rh', S * 0.018), smooth([P('ls'), P('neck'), P('rs')], { width: 2.8, ...o }), smooth([P('lh'), P('rh')], { width: 2.8, ...o })];
  };
  const rhythm = (o = {}) => [limb('ls', 'le', 'lhand', o), limb('rs', 're', 'rhand', o), limb('lh', 'lk', 'lf', o), limb('rh', 'rk', 'rf', o), torso(o)];
  // a tapered tube along three joints: widths at start, middle and end
  const tube = (a, b, c, widths, o = {}) => {
    const pts = [P(a), P(b), P(c)]; const samples = [];
    for (let i = 0; i <= 12; i += 1) { const t = i / 12; const u = t < 0.5 ? t * 2 : (t - 0.5) * 2; const [p, q] = t < 0.5 ? [pts[0], pts[1]] : [pts[1], pts[2]];
      const x = p[0] + (q[0] - p[0]) * u; const y = p[1] + (q[1] - p[1]) * u; const wd = t < 0.5 ? widths[0] + (widths[1] - widths[0]) * (t * 2) : widths[1] + (widths[2] - widths[1]) * ((t - 0.5) * 2); samples.push([x, y, wd * S]); }
    const left = []; const right = [];
    samples.forEach(([x, y, wd], i) => { const [x0, y0] = samples[Math.max(0, i - 1)]; const [x1, y1] = samples[Math.min(samples.length - 1, i + 1)]; const dx = x1 - x0; const dy = y1 - y0; const len = Math.hypot(dx, dy) || 1;
      left.push([x + (-dy / len) * wd / 2, y + (dx / len) * wd / 2]); right.push([x - (-dy / len) * wd / 2, y - (dx / len) * wd / 2]); });
    return smooth([...left, ...right.reverse()], { closed: true, width: 2.2, ...o });
  };
  const forms = (o = {}) => {
    const ang = (a, b) => (Math.atan2(P(b)[1] - P(a)[1], P(b)[0] - P(a)[0]) * 180) / Math.PI;
    const span = (a, b) => Math.hypot(P(b)[0] - P(a)[0], P(b)[1] - P(a)[1]);
    return [
      head(o),
      ellipse(...P('chest'), span('ls', 'rs') * 0.56, S * 0.085, { angle: ang('ls', 'rs'), width: 2.2, ...o }),
      ellipse(...P('pelvis'), span('lh', 'rh') * 0.6, S * 0.065, { angle: ang('lh', 'rh'), width: 2.2, ...o }),
      tube('ls', 'le', 'lhand', [0.04, 0.035, 0.025], o), tube('rs', 're', 'rhand', [0.04, 0.035, 0.025], o),
      tube('lh', 'lk', 'lf', [0.075, 0.045, 0.028], o), tube('rh', 'rk', 'rf', [0.075, 0.045, 0.028], o),
    ];
  };
  return { P, action, head, rhythm, forms, limb, torso };
}

// Rhythm lines: a few curves for the arms and legs, over the line of action.
export default (L) => {
  const { svg, rect, text } = L; const g = figure(L, POSES.walk, 40, 26, 290);
  return svg({ width: 480, height: 330 },
    rect(16, 16, 448, 300, { rx: 4 }),
    g.head({ width: 2.2 }), g.action(),
    g.rhythm({ width: 2.8 }),
    text(320, 120, 'arms: one curve each', { size: 13 }),
    text(320, 260, 'legs: one curve each', { size: 13 }),
  );
};
