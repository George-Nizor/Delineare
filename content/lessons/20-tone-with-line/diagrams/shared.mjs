// Hatching helpers for this lesson's diagrams. Not a diagram itself.

// Parallel lines at `angle` degrees, `gap` apart, clipped to the box (x, y, w, h). Each line is a
// little uneven in length and drifts slightly, as a quick hand-drawn line does.
export function hatchBox(kit, x, y, w, h, { angle = 55, gap = 8, seed = 1, width = 1.3, wobble = 0.5, cls = 'd-ink', dots = 0, fade = null } = {}) {
  const next = kit.random(seed);
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = -Math.sin(a);
  const reach = Math.abs(w * dy) + Math.abs(h * dx);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const out = [];
  for (let s = -reach / 2; s <= reach / 2; s += gap) {
    const px = cx - dy * s;
    const py = cy + dx * s;
    // Clip the infinite line through (px, py) with direction (dx, dy) to the box.
    let t0 = -1e9;
    let t1 = 1e9;
    for (const [p, d, lo, hi] of [[px, dx, x, x + w], [py, dy, y, y + h]]) {
      if (Math.abs(d) < 1e-9) {
        if (p < lo || p > hi) { t0 = 1; t1 = 0; }
      } else {
        const ta = (lo - p) / d;
        const tb = (hi - p) / d;
        t0 = Math.max(t0, Math.min(ta, tb));
        t1 = Math.min(t1, Math.max(ta, tb));
      }
    }
    if (fade && Math.abs(dx) > 1e-6) {
      // Each line starts somewhere inside the fade zone, so a layer thins out instead of stopping.
      const cut = fade[0] + next() * (fade[1] - fade[0]);
      if (dx > 0) t0 = Math.max(t0, (cut - px) / dx);
      else t1 = Math.min(t1, (cut - px) / dx);
    }
    if (t1 <= t0) continue;
    const jitter = (next() - 0.5) * wobble * 2;
    const [x1, y1, x2, y2] = [px + dx * t0 + jitter, py + dy * t0, px + dx * t1 - jitter, py + dy * t1 + jitter];
    out.push(kit.line(x1, y1, x2, y2, { width, cls }));
    if (dots) out.push(kit.dot(x1, y1, { r: dots }), kit.dot(x2, y2, { r: dots }));
  }
  return out;
}

// Layers of hatching in one box, each at its own angle. `layers` is a list of [angle, gap].
export function layered(kit, x, y, w, h, layers, seed = 1, width = 1.3) {
  return layers.map(([angle, gap], i) => hatchBox(kit, x, y, w, h, { angle, gap, seed: seed + i * 7, width }));
}

// Light on the sphere comes from the upper left. Returns how bright a point on the sphere is, 0 to 1.
const LIGHT = (() => {
  const v = [-0.55, -0.6, 0.58];
  const m = Math.hypot(...v);
  return v.map((c) => c / m);
})();
export function brightness(px, py, r) {
  const z2 = r * r - px * px - py * py;
  if (z2 < 0) return null;
  return Math.max(0, (px * LIGHT[0] + py * LIGHT[1] + Math.sqrt(z2) * LIGHT[2]) / r);
}

// A ball shaded with curved hatching: each layer is a set of evenly spaced arcs that bow round the
// form, and a layer only draws where the ball is darker than its threshold. The lit side stays
// paper. Later layers turn to cross the earlier ones.
export function hatchedBall(kit, cx, cy, r, { seed = 3, gap = 6.5, width = 1.15 } = {}) {
  const out = [kit.circle(cx, cy, r, { width: 1.8 })];
  const next = kit.random(seed);
  const layers = [[-35, 0.62], [38, 0.46], [-8, 0.32], [70, 0.2]];
  for (const [deg, level] of layers) {
    const a = (deg * Math.PI) / 180;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    for (let t = -r - 10; t <= r + 10; t += gap) {
      let run = [];
      const flush = () => { if (run.length > 2) out.push(kit.smooth(run, { width })); run = []; };
      for (let s = -r; s <= r; s += 3) {
        const v = t + 0.3 * r * (1 - (s / r) ** 2) * 0.6 + (next() - 0.5) * 0.15;
        const px = s * ux - v * uy;
        const py = s * uy + v * ux;
        const b = brightness(px, py, r);
        if (b !== null && b < level) run.push([cx + px, cy + py]);
        else flush();
      }
      flush();
    }
  }
  return out;
}

// A strip graded from paper to dark. Each layer runs from its own start to the far end, its lines
// beginning at different points inside a short fade zone so the tone thickens gradually.
export function gradedStrip(kit, x, y, w, h, { seed = 5 } = {}) {
  const spec = [[58, 13, 0.1], [118, 13, 0.3], [28, 11, 0.48], [88, 10, 0.62], [58, 6, 0.74], [118, 6, 0.84], [28, 5.5, 0.92]];
  const out = spec.map(([angle, gap, start], i) => hatchBox(kit, x, y, w, h, {
    angle, gap, seed: seed + i * 7, width: 1.1, wobble: 0.1, fade: [x + w * start, x + w * (start + 0.16)],
  }));
  out.push(kit.rect(x, y, w, h, { cls: 'd-frame', stroke: 1.2 }));
  return out;
}

// Tone is judged against a neutral ground in both themes, so a tonal diagram uses fixed greys
// and never follows the light or dark theme. This swaps the theme classes for fixed colours.
export function tonal(svg, { ground = '#e6e6e6' } = {}) {
  const map = [
    ['class="d-tag d-tag-bad"', 'fill="#9a3a1e" font-weight="600" letter-spacing="0.02em"'],
    ['class="d-tag"', 'fill="#4f5200" font-weight="600" letter-spacing="0.02em"'],
    ['class="d-label"', 'fill="#3a3a3a"'],
    ['class="d-ink"', 'stroke="#161616"'],
    ['class="d-guide"', 'stroke="#808080"'],
    ['class="d-mark"', 'stroke="#5d6200"'],
    ['class="d-bad"', 'stroke="#9a3a1e"'],
    ['class="d-dot"', 'fill="#161616"'],
    ['class="d-frame"', 'fill="none" stroke="#161616"'],
    ['class="d-fill"', 'fill="#3b3b3b" stroke="none"'],
    ['class="d-fill-soft"', 'fill="#9a9a9a" stroke="none"'],
    ['class="d-lit"', 'fill="#f4f4f4" stroke="none"'],
    ['class="d-paper"', `fill="${ground}" stroke="#a8a8a8"`],
  ];
  let out = svg;
  for (const [from, to] of map) out = out.split(from).join(to);
  return out.replace('class="diagram-svg"', 'class="diagram-svg" font-family="inherit"');
}
