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

// ---- a sausage form: two equal ends joined by a tube of constant width along a bent spine
function sausage(L, h, [p0, p1, p2], r) {
  const at = (t) => { const a = (1 - t) * (1 - t); const b = 2 * (1 - t) * t; const c = t * t; return [a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]; };
  const tan = (t) => { const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]); const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]); const l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  const nor = (t) => { const [x, y] = tan(t); return [-y, x]; };
  const steps = 60;
  const left = []; const right = [];
  for (let i = 0; i <= steps; i += 1) { const t = i / steps; const c = at(t); const n = nor(t); left.push([c[0] + n[0] * r, c[1] + n[1] * r]); right.push([c[0] - n[0] * r, c[1] - n[1] * r]); }
  const cap = (t, sign) => { const c = at(t); const T = tan(t); const n = nor(t); const out = []; for (let i = 1; i < 24; i += 1) { const a = (i / 24) * Math.PI; out.push([c[0] + n[0] * r * Math.cos(a) * sign + T[0] * r * Math.sin(a) * sign, c[1] + n[1] * r * Math.cos(a) * sign + T[1] * r * Math.sin(a) * sign]); } return out; };
  const outline = [...left, ...cap(1, 1), ...right.reverse(), ...cap(0, -1)];
  // a point on the ellipse around the sausage at t; angle a runs 0..2pi, minor axis along the spine
  const ringPoint = (t, k, a, scale = 1) => { const c = at(t); const T = tan(t); const n = nor(t); return [c[0] + n[0] * r * scale * Math.cos(a) + T[0] * r * scale * k * Math.sin(a), c[1] + n[1] * r * scale * Math.cos(a) + T[1] * r * scale * k * Math.sin(a)]; };
  const degree = (t) => 0.2 + 0.28 * t;
  const ellipseAt = (t, { k = degree(t), width = 2, cls = 'd-ink', passes = 2 } = {}) => Array.from({ length: passes }, (_, p) => {
    const pts = []; for (let i = 0; i <= 56; i += 1) pts.push(ringPoint(t, k * (1 + p * 0.04), (i / 56) * Math.PI * 2 + p * 0.5));
    return L.smooth(pts, { width, cls });
  });
  // the visible half of the contour line, bulging toward the near end, overshooting a little round each edge
  const curveAt = (t, { k = degree(t), width = 2, cls = 'd-ink', over = 0.16 } = {}) => {
    const pts = []; for (let i = 0; i <= 30; i += 1) pts.push(ringPoint(t, k, Math.PI - over + (i / 30) * (Math.PI + over * 2)));
    return L.smooth(pts, { width, cls });
  };
  const spine = ({ cls = 'd-mark', width = 2, extend = 0 } = {}) => { const pts = []; for (let i = 0; i <= 30; i += 1) pts.push(at(i / 30)); return L.smooth(pts, { cls, width }); };
  return { at, tan, nor, outline: ({ cls = 'd-ink', width = 2.4 } = {}) => h.poly(outline, { close: true, cls, width }), ellipseAt, curveAt, spine, ringPoint, degree, r };
}

// A simple sausage: two equal round ends joined by a tube of constant width.
export default (L) => {
  const { svg, rect, text, circle } = L; const h = helpers(L);
  const pts = [[110, 170], [200, 70], [330, 150]]; const r = 34; const s = sausage(L, h, pts, r);
  const mid = s.at(0.5); const n = s.nor(0.5);
  return svg({ width: 480, height: 275 }, rect(16, 16, 448, 243, { rx: 4 }),
    circle(...s.at(0), r, { cls: 'd-guide', width: 1.4, dash: '5 6' }), circle(...s.at(1), r, { cls: 'd-guide', width: 1.4, dash: '5 6' }),
    s.outline(),
    h.dim(mid[0] + n[0] * r, mid[1] + n[1] * r, mid[0] - n[0] * r, mid[1] - n[1] * r, null, { side: 1 }),
    text(110, 248, 'two equal ends', { anchor: 'middle', size: 13 }), text(345, 248, 'tube of one width', { anchor: 'middle', size: 13 }),
  );
};
