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

// ---- boxes in one-point perspective: the back face is the front face scaled toward the vanishing point
function onePoint(L, h, vp, s = 0.62) {
  const box = (x, y, w, hh, { hiddenDash = '5 5' } = {}) => {
    const front = [[x, y], [x + w, y], [x + w, y + hh], [x, y + hh]];
    const back = front.map(([px, py]) => [vp[0] + (px - vp[0]) * s, vp[1] + (py - vp[1]) * s]);
    const faces = [front];
    if (vp[0] > x + w) faces.push([front[1], back[1], back[2], front[2]]);      // right side, seen when the point is to the right
    if (vp[0] < x) faces.push([front[0], back[0], back[3], front[3]]);          // left side
    if (vp[1] > y + hh) faces.push([front[2], back[2], back[3], front[3]]);     // underside, seen when the box is above the horizon
    if (vp[1] < y) faces.push([front[0], back[0], back[1], front[1]]);          // top, seen when the box is below the horizon
    const edges = new Map(); const key = (a, b) => [a, b].map((p) => `${f2(p[0])},${f2(p[1])}`).sort().join('|');
    const all = [[front[0], front[1]], [front[1], front[2]], [front[2], front[3]], [front[3], front[0]], [back[0], back[1]], [back[1], back[2]], [back[2], back[3]], [back[3], back[0]], ...front.map((p, i) => [p, back[i]])];
    all.forEach(([a, b]) => edges.set(key(a, b), { a, b, visible: false }));
    faces.forEach((poly) => poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; const e = edges.get(key(p, q)); if (e) e.visible = true; }));
    const shape = [...edges.values()];
    return {
      front, back, faces,
      draw: ({ width = 2.2, cls = 'd-ink', through = true } = {}) => shape.map((e) => (e.visible ? h.poly([e.a, e.b], { cls, width }) : (through ? h.poly([e.a, e.b], { cls: 'd-guide', width: 1.3, dash: hiddenDash }) : ''))),
      rays: ({ cls = 'd-guide', width = 1.2 } = {}) => front.map((p) => h.poly([p, vp], { cls, width })),
    };
  };
  return { box };
}

// The usual mistake: a box far from the vanishing point, beside boxes close to it.
export default (L) => {
  const { svg, rect, line, dot, text } = L; const h = helpers(L);
  const vpA = [70, 140]; const vpB = [416, 140]; const a = onePoint(L, h, vpA, 0.5); const b = onePoint(L, h, vpB, 0.62);
  return svg({ width: 560, height: 280 },
    rect(16, 16, 256, 248, { rx: 3 }), rect(288, 16, 256, 248, { rx: 3 }),
    text(144, 42, 'Far from the point', { anchor: 'middle', size: 14, cls: 'd-tag d-tag-bad' }),
    line(28, 140, 262, 140, { cls: 'd-guide', width: 1.4 }), dot(...vpA, { r: 4 }),
    a.box(170, 90, 80, 80).draw({ cls: 'd-bad' }),
    text(144, 244, 'long edges, looks stretched', { anchor: 'middle', size: 13 }),
    text(416, 42, 'Near the point', { anchor: 'middle', size: 14, cls: 'd-tag' }),
    line(300, 140, 534, 140, { cls: 'd-guide', width: 1.4 }), dot(...vpB, { r: 4 }),
    b.box(344, 96, 62, 56).draw(), b.box(436, 120, 56, 52).draw(),
    text(416, 244, 'box close to the point', { anchor: 'middle', size: 13 }),
  );
};
