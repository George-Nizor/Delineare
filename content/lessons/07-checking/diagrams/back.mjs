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
  const mug = (x, y, w, h, { cls = 'd-ink', width = 2.2, handle = true } = {}) => {
    const ry = w * 0.15; const cx = x + w / 2;
    const out = [
      L.ellipse(cx, y + ry, w / 2, ry, { cls, width }),
      line(x, y + ry, x, y + h - ry, { cls, width }), line(x + w, y + ry, x + w, y + h - ry, { cls, width }),
      path(`M ${f2(x)} ${f2(y + h - ry)} A ${f2(w / 2)} ${f2(ry)} 0 0 0 ${f2(x + w)} ${f2(y + h - ry)}`, { cls, width }),
    ];
    if (handle) out.push(path(`M ${f2(x + w)} ${f2(y + h * 0.26)} C ${f2(x + w * 1.5)} ${f2(y + h * 0.2)} ${f2(x + w * 1.5)} ${f2(y + h * 0.72)} ${f2(x + w)} ${f2(y + h * 0.7)}`, { cls, width }));
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

// Stepping back: close up you see parts, further away you see how the parts relate.
export default (L) => {
  const { svg, rect, text, line } = L; const h = helpers(L);
  const clip = '<clipPath id="back-clip"><rect x="24" y="24" width="244" height="200"/></clipPath>';
  const big = h.chair(30, -10, 260, 400, { width: 3 });
  return svg({ width: 560, height: 260 },
    `<defs>${clip}</defs>`,
    rect(16, 16, 256, 218, { rx: 3 }), rect(288, 16, 256, 218, { rx: 3 }),
    `<g clip-path="url(#back-clip)">${big.join('')}</g>`,
    text(144, 250, 'close: you see parts', { anchor: 'middle', size: 13 }),
    h.chair(376, 58, 80, 120, { width: 1.8 }),
    ...h.eye(512, 118, { r: 10 }),
    line(498, 118, 466, 118, { cls: 'd-guide', width: 1.4, dash: '4 5' }),
    text(416, 250, 'back: you see the whole', { anchor: 'middle', size: 13 }),
  );
};
