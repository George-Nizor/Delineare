// A freehand box and its line extensions, shared by lesson 13's diagrams (not a diagram itself).
import { scene, depth } from './scene.js';

const rnd = (seed) => {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

// The box drawn by hand: each corner lands a little off, by up to `slop` units, so the edges
// converge only roughly. Returns the scene plus the drawn corners.
export function handBox(options = {}, { slop = 1.8, seed = 3 } = {}) {
  const s = scene(options);
  const next = rnd(seed);
  const drawn = s.b.corners.map(([x, y]) => [x + (next() - 0.5) * 2 * slop, y + (next() - 0.5) * 2 * slop]);
  return { ...s, drawn };
}

// Draw the box (all twelve edges, hidden ones as guide dashes) and, for the nine edges the viewer
// sees, an extension back from the edge's far end towards its vanishing point.
export function drawHandBox(kit, s, { reach = 0.96, width = 2.4, extend = true, marks = true } = {}) {
  const out = [];
  const set = { u: 'u', v: 'v', up: 'up' };
  for (const e of s.b.edges) {
    const [p, q] = [s.drawn[e.a], s.drawn[e.b]];
    out.push(kit.line(p[0], p[1], q[0], q[1], e.seen ? { width } : { width: width * 0.7, cls: 'd-guide', dash: '4 5' }));
    if (extend && e.seen) {
      const [near, far] = depth(s, e.a) < depth(s, e.b) ? [p, q] : [q, p];
      const vp = s.vps[set[e.axis]];
      const dx = far[0] - near[0];
      const dy = far[1] - near[1];
      const len = Math.hypot(dx, dy) || 1;
      const reachLen = ((vp[0] - far[0]) * dx + (vp[1] - far[1]) * dy) / len;
      const t = Math.max(0, reachLen * reach);
      out.push(kit.line(far[0], far[1], far[0] + (dx / len) * t, far[1] + (dy / len) * t, { cls: 'd-mark', width: 1.3 }));
    }
  }
  if (marks) for (const k of ['u', 'v', 'up']) out.push(kit.dot(s.vps[k][0], s.vps[k][1], { r: 4, cls: 'd-mark-fill' }));
  return out;
}

export const bounds = (s) => {
  const xs = s.drawn.map((c) => c[0]);
  const ys = s.drawn.map((c) => c[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};

// Wrap scene-space markup so the box centres on (cx, cy) at the given scale.
export function placed(s, cx, cy, scale, markup) {
  const b = bounds(s);
  const mx = (b.x0 + b.x1) / 2;
  const my = (b.y0 + b.y1) / 2;
  return `<g transform="translate(${(cx - mx * scale).toFixed(2)} ${(cy - my * scale).toFixed(2)}) scale(${scale})">${[markup].flat(Infinity).join('')}</g>`;
}
