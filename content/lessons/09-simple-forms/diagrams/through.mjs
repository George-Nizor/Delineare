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

// ---- boxes, cylinders and spheres placed in 3D and projected through one camera with real perspective
function camera({ yaw = 30, pitch = 22, dist = 7, f = 430, cx = 0, cy = 0 } = {}) {
  const ya = (yaw * Math.PI) / 180; const pa = (pitch * Math.PI) / 180;
  return ([x, y, z]) => {
    const X = x * Math.cos(ya) - z * Math.sin(ya); const Z = x * Math.sin(ya) + z * Math.cos(ya);
    const Y = y * Math.cos(pa) - Z * Math.sin(pa); const Z2 = y * Math.sin(pa) + Z * Math.cos(pa);
    const s = f / (dist + Z2);
    return [cx + X * s, cy - Y * s, Z2, s];
  };
}
function hull(points) {
  const p = points.map(([x, y]) => [x, y]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = []; for (const q of p) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  const upper = []; for (const q of p.reverse()) { while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
function solids(L, project) {
  const h = helpers(L); const { path } = L;
  const ring = (c, r, axis, n = 64) => {
    // a circle of radius r around centre c in the plane perpendicular to axis
    const a = axis; const up = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const u = [a[1] * up[2] - a[2] * up[1], a[2] * up[0] - a[0] * up[2], a[0] * up[1] - a[1] * up[0]]; const ul = Math.hypot(...u); const U = u.map((k) => k / ul);
    const V = [a[1] * U[2] - a[2] * U[1], a[2] * U[0] - a[0] * U[2], a[0] * U[1] - a[1] * U[0]];
    return Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return project([c[0] + r * (U[0] * Math.cos(t) + V[0] * Math.sin(t)), c[1] + r * (U[1] * Math.cos(t) + V[1] * Math.sin(t)), c[2] + r * (U[2] * Math.cos(t) + V[2] * Math.sin(t))]); });
  };
  const loop = (pts, o) => path(`${h.d(pts, true)}`, { width: 2.2, ...o });
  // split a ring into its near and far halves relative to its centre depth
  const halves = (pts, zc) => { const near = []; const far = []; pts.forEach((p, i) => { (p[2] <= zc ? near : far).push(i); }); return [near, far]; };
  const arcs = (pts, idx, o) => { const out = []; let run = []; const n = pts.length; const set = new Set(idx);
    const start = idx.length === n ? 0 : [...Array(n).keys()].find((i) => set.has(i) && !set.has((i + n - 1) % n)); if (start === undefined) return out;
    for (let k = 0; k <= n; k += 1) { const i = (start + k) % n; if (set.has(i) && k < n) run.push(pts[i]); else { if (run.length > 1) out.push(h.poly(run, o)); run = []; } }
    if (run.length > 1) out.push(h.poly(run, o)); return out; };
  const box = (c, [sx, sy, sz], { turn = 0 } = {}) => {
    const t = (turn * Math.PI) / 180; const corners = [];
    for (let i = 0; i < 8; i += 1) { const x = (i & 1 ? 1 : -1) * sx / 2; const y = (i & 2 ? 1 : -1) * sy / 2; const z = (i & 4 ? 1 : -1) * sz / 2; corners.push(project([c[0] + x * Math.cos(t) - z * Math.sin(t), c[1] + y, c[2] + x * Math.sin(t) + z * Math.cos(t)])); }
    const far = corners.reduce((m, p, i) => (p[2] > corners[m][2] ? i : m), 0);
    const edges = []; for (let i = 0; i < 8; i += 1) for (const bit of [1, 2, 4]) if (!(i & bit)) edges.push([i, i | bit]);
    return { z: corners.reduce((a, p) => a + p[2], 0) / 8, shape: hull(corners), pts: corners,
      lines: ({ width = 2.2, hidden = 'd-guide', cls = 'd-ink', through = true } = {}) => edges.map(([a, b]) => ((a === far || b === far) ? (through ? h.poly([corners[a], corners[b]], { cls: hidden, width: Math.max(1.2, width - 0.8), dash: '5 5' }) : '') : h.poly([corners[a], corners[b]], { cls, width }))) };
  };
  const cylinder = (c, r, len, { tilt = 0 } = {}) => {
    const t = (tilt * Math.PI) / 180; const axis = [Math.sin(t), Math.cos(t), 0];
    const top = [c[0] + axis[0] * len / 2, c[1] + axis[1] * len / 2, c[2]]; const bot = [c[0] - axis[0] * len / 2, c[1] - axis[1] * len / 2, c[2]];
    const rt = ring(top, r, axis); const rb = ring(bot, r, axis); const ct = project(top); const cb = project(bot);
    const dx = cb[0] - ct[0]; const dy = cb[1] - ct[1]; const L2 = Math.hypot(dx, dy) || 1; const nx = -dy / L2; const ny = dx / L2;
    const ext = (ring2, sign) => ring2.reduce((m, p) => ((p[0] * nx + p[1] * ny) * sign > (m[0] * nx + m[1] * ny) * sign ? p : m), ring2[0]);
    const [nearB, farB] = halves(rb, cb[2]);
    return { z: (ct[2] + cb[2]) / 2, shape: hull([...rt, ...rb]), pts: [...rt, ...rb],
      lines: ({ width = 2.2, hidden = 'd-guide', cls = 'd-ink', through = true } = {}) => [loop(rt, { cls, width }), ...arcs(rb, nearB, { cls, width }), ...(through ? arcs(rb, farB, { cls: hidden, width: Math.max(1.2, width - 0.8), dash: '5 5' }) : []),
        h.poly([ext(rt, 1), ext(rb, 1)], { cls, width }), h.poly([ext(rt, -1), ext(rb, -1)], { cls, width })] };
  };
  const sphere = (c, r) => {
    const pc = project(c); const pr = r * pc[3]; const eq = ring(c, r, [0, 1, 0]); const [nearE, farE] = halves(eq, pc[2]);
    const circ = Array.from({ length: 48 }, (_, i) => [pc[0] + pr * Math.cos((i / 48) * 6.2832), pc[1] + pr * Math.sin((i / 48) * 6.2832), pc[2]]);
    return { z: pc[2], shape: circ, pts: circ,
      lines: ({ width = 2.2, hidden = 'd-guide', cls = 'd-ink', through = true } = {}) => [loop(circ, { cls, width }), ...arcs(eq, nearE, { cls, width: Math.max(1.2, width - 0.6) }), ...(through ? arcs(eq, farE, { cls: hidden, width: 1.2, dash: '5 5' }) : [])] };
  };
  // draw forms far to near, each one covering what is behind it
  const stack = (items, opts = {}) => { const sorted = [...items].sort((a, b) => b.z - a.z); const base = opts.width ?? 2.2; return sorted.map((it, i) => [h.solid(it.shape), it.lines({ ...opts, width: base * (0.85 + (0.35 * i) / Math.max(1, sorted.length - 1)) })]); };
  return { box, cylinder, sphere, stack };
}

// Drawing through: the back edges of the box and the whole of every ellipse are drawn.
export default (L) => {
  const { svg, rect, text, handEllipse } = L;
  const mk = (cx) => solids(L, camera({ cx, cy: 115, dist: 15, f: 860, yaw: 28, pitch: 24 }));
  return svg({ width: 560, height: 230 },
    rect(16, 16, 528, 198, { rx: 4 }),
    mk(110).box([0, 0, 0], [1.5, 1.5, 1.5]).lines({ width: 2.4 }),
    mk(280).cylinder([0, 0, 0], 0.8, 1.7).lines({ width: 2.4 }),
    handEllipse(450, 108, 56, 56, { passes: 2, width: 2.2, seed: 4 }),
    mk(450).sphere([0, 0, 0], 0.95).lines({ width: 2.2 }).slice(1),
    text(110, 196, 'back edges drawn', { anchor: 'middle', size: 13 }), text(280, 196, 'both ellipses whole', { anchor: 'middle', size: 13 }), text(450, 196, 'round twice', { anchor: 'middle', size: 13 }),
  );
};
