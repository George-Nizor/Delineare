// The drawing kit for lesson diagrams. Each diagram is a small script that returns SVG markup built
// from these helpers, so lines, ellipses and boxes come from real geometry. Colours are CSS classes
// the app defines (d-ink, d-guide, d-mark, d-bad, d-paper, d-text, d-label), so every diagram follows
// the light or dark theme without a second copy.

const n = (value) => Number(value.toFixed(2));
const attrs = (entries) => Object.entries(entries)
  .filter(([, value]) => value !== undefined && value !== null && value !== false)
  .map(([key, value]) => ` ${key}="${typeof value === 'number' ? n(value) : String(value).replace(/"/g, '&quot;')}"`)
  .join('');
const esc = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function svg({ width, height }, ...children) {
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" class="diagram-svg" aria-hidden="true">${children.flat(Infinity).join('')}</svg>`;
}

export function group({ translate, rotate, cls } = {}, ...children) {
  const transform = [translate && `translate(${n(translate[0])} ${n(translate[1])})`, rotate && `rotate(${n(rotate[0])} ${n(rotate[1])} ${n(rotate[2])})`].filter(Boolean).join(' ');
  return `<g${attrs({ transform: transform || undefined, class: cls })}>${children.flat(Infinity).join('')}</g>`;
}

export function line(x1, y1, x2, y2, { cls = 'd-ink', width = 2.4, dash } = {}) {
  return `<line${attrs({ x1, y1, x2, y2, class: cls, 'stroke-width': width, 'stroke-dasharray': dash, 'stroke-linecap': 'round', fill: 'none' })}/>`;
}

export function path(d, { cls = 'd-ink', width = 2.4, dash, fill = 'none' } = {}) {
  return `<path${attrs({ d, class: cls, 'stroke-width': width, 'stroke-dasharray': dash, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill })}/>`;
}

export function polyline(points, options = {}) {
  return path(`M ${points.map(([x, y]) => `${n(x)} ${n(y)}`).join(' L ')}`, options);
}

export function dot(x, y, { r = 3.4, cls = 'd-dot' } = {}) {
  return `<circle${attrs({ cx: x, cy: y, r, class: cls })}/>`;
}

export function circle(cx, cy, r, { cls = 'd-ink', width = 2.4, dash } = {}) {
  return `<circle${attrs({ cx, cy, r, class: cls, 'stroke-width': width, 'stroke-dasharray': dash, fill: 'none' })}/>`;
}

export function ellipse(cx, cy, rx, ry, { angle = 0, cls = 'd-ink', width = 2.4, dash } = {}) {
  return `<ellipse${attrs({ cx, cy, rx, ry, transform: angle ? `rotate(${n(angle)} ${n(cx)} ${n(cy)})` : undefined, class: cls, 'stroke-width': width, 'stroke-dasharray': dash, fill: 'none' })}/>`;
}

export function rect(x, y, width, height, { cls = 'd-paper', rx = 0, stroke = 1.2 } = {}) {
  return `<rect${attrs({ x, y, width, height, rx, class: cls, 'stroke-width': stroke })}/>`;
}

export function text(x, y, content, { cls = 'd-label', anchor = 'start', size = 14 } = {}) {
  return `<text${attrs({ x, y, class: cls, 'text-anchor': anchor, 'font-size': size })}>${esc(content)}</text>`;
}

// An arrowhead at (x, y) pointing along angle (radians).
export function arrowhead(x, y, angle, { size = 9, cls = 'd-mark', width = 2.2 } = {}) {
  const a = angle + Math.PI - 0.45;
  const b = angle + Math.PI + 0.45;
  return path(`M ${n(x + Math.cos(a) * size)} ${n(y + Math.sin(a) * size)} L ${n(x)} ${n(y)} L ${n(x + Math.cos(b) * size)} ${n(y + Math.sin(b) * size)}`, { cls, width });
}

// A gentle arc from one point to another, bowed by `lift` (negative bows up), with an arrowhead.
export function arcArrow(x1, y1, x2, y2, { lift = -18, cls = 'd-mark', width = 2, dash } = {}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / length) * -lift;
  const cy = my + (dx / length) * -lift;
  const angle = Math.atan2(y2 - cy, x2 - cx);
  return [path(`M ${n(x1)} ${n(y1)} Q ${n(cx)} ${n(cy)} ${n(x2)} ${n(y2)}`, { cls, width, dash }), arrowhead(x2, y2, angle, { cls, width })];
}

// A seeded random generator, so a diagram comes out the same on every build.
export function random(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// A hesitant line: the stroke a learner makes by slowing down and steering. It drifts from side to
// side in slow waves rather than shaking. `amount` is the largest drift in diagram units; `stop` is
// how far along it gives up (1 reaches the end).
export function wobblyLine(x1, y1, x2, y2, { amount = 2.2, seed = 7, stop = 1, cls = 'd-ink', width = 2.4 } = {}) {
  const next = random(seed);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  // A few control offsets along the line, smoothed into a curve through their midpoints.
  const knots = 9;
  const offsets = Array.from({ length: knots + 1 }, (_, i) => (i === 0 ? 0 : (next() - 0.5) * 2 * amount));
  const points = offsets.map((offset, i) => {
    const t = (i / knots) * stop;
    return [x1 + dx * t + nx * offset, y1 + dy * t + ny * offset];
  });
  let d = `M ${n(points[0][0])} ${n(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const [cx, cy] = points[i];
    const [nx2, ny2] = points[i + 1];
    d += ` Q ${n(cx)} ${n(cy)} ${n((cx + nx2) / 2)} ${n((cy + ny2) / 2)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${n(last[0])} ${n(last[1])}`;
  return path(d, { cls, width });
}

// An ellipse drawn the way a hand draws it: `passes` times round, each pass drifting a little in
// size and position and overlapping where it starts. `angle` turns the ellipse in degrees.
// `lumpy` adds the bumps of a slow, careful stroke. One pass with lumpy set is the usual mistake.
export function handEllipse(cx, cy, rx, ry, { angle = 0, passes = 2, seed = 9, drift = 1.6, lumpy = 0, start = 0.7, cls = 'd-ink', width = 2 } = {}) {
  const next = random(seed);
  const turn = (angle * Math.PI) / 180;
  const out = [];
  for (let pass = 0; pass < passes; pass += 1) {
    const dx = (next() - 0.5) * drift;
    const dy = (next() - 0.5) * drift;
    const sx = 1 + (next() - 0.5) * drift * 0.02;
    const sy = 1 + (next() - 0.5) * drift * 0.04;
    const steps = 72;
    const sweep = passes > 1 ? 1.08 : 1.02;
    const bumps = Array.from({ length: 7 }, () => (next() - 0.5) * lumpy);
    const points = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = start + (i / steps) * sweep * Math.PI * 2;
      const bump = lumpy ? bumps[Math.floor(((i / steps) * 7) % 7)] * Math.sin((i / steps) * Math.PI * 14) : 0;
      const ex = Math.cos(t) * (rx * sx + bump);
      const ey = Math.sin(t) * (ry * sy + bump);
      points.push([cx + dx + ex * Math.cos(turn) - ey * Math.sin(turn), cy + dy + ex * Math.sin(turn) + ey * Math.cos(turn)]);
    }
    out.push(smooth(points, { cls, width }));
  }
  return out;
}

// A smooth freehand curve through points (quadratic segments through the midpoints).
export function smooth(points, { cls = 'd-ink', width = 2.4, closed = false, dash } = {}) {
  if (points.length < 3) return polyline(points, { cls, width, dash });
  const pts = closed ? [...points, points[0], points[1]] : points;
  let d = `M ${n(pts[0][0])} ${n(pts[0][1])}`;
  if (!closed) d += ` L ${n((pts[0][0] + pts[1][0]) / 2)} ${n((pts[0][1] + pts[1][1]) / 2)}`;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const [x, y] = pts[i];
    const [x2, y2] = pts[i + 1];
    d += ` Q ${n(x)} ${n(y)} ${n((x + x2) / 2)} ${n((y + y2) / 2)}`;
  }
  if (!closed) d += ` L ${n(pts[pts.length - 1][0])} ${n(pts[pts.length - 1][1])}`;
  return path(d, { cls, width, dash });
}

// A label pill used to tag the two halves of a wrong-and-right pair.
export function tag(x, y, content, { tone = 'mark', anchor = 'middle' } = {}) {
  return text(x, y, content, { cls: tone === 'bad' ? 'd-tag d-tag-bad' : 'd-tag', anchor, size: 14 });
}
