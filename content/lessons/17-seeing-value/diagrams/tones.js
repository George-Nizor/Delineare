// Tones for lessons 17 to 19's diagrams (not a diagram itself). Value is judged against a neutral
// grey in both themes, so these are fixed greys and never follow the light or dark theme.
import { mug } from '../../15-building-objects/diagrams/mug.js';

export const TONE = { white: '#f4f4f4', light: '#dcdcdc', mid: '#9a9a9a', dark: '#3b3b3b', black: '#161616', ground: '#b4b4b4' };

// The neutral panel every tonal diagram sits on.
export const panel = (x, y, w, h, fill = TONE.ground) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="#8a8a8a" stroke-width="1"/>`;

export const poly = (pts, fill, extra = '') => `<path d="M ${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ')} Z" fill="${fill}" stroke="none" ${extra}/>`;
export const pathOf = (pts) => `M ${pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ')} Z`;

export function hull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of pts.slice().reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// The mug as flat shapes under a lamp on the left: the lit third of the body, the middle third,
// the shadow side, the open top, the handle in shade and the shadow on the table. `mode` picks how
// the shapes are painted: 'flat' (three values), 'outline' (borders only), 'white' (every shape
// the same pale tone, the local-value mistake), 'smooth' (a soft gradient, as the eye sees it).
export function toneMug(kit, { id = 'a', mode = 'flat', cx = 190, cy = 215, f = 500 } = {}) {
  const m = mug({ cx, cy, f });
  const body = hull(m.cyl.near.concat(m.cyl.far));
  const xs = body.map((p) => p[0]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const ys = body.map((p) => p[1]);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const a = x0 + (x1 - x0) * 0.34;
  const b = x0 + (x1 - x0) * 0.66;
  const handle = m.outer.concat(m.inner.slice().reverse());
  const baseC = m.cyl.p0;
  // Shadow on the table: a squashed shape that leaves the right foot of the mug.
  const shadow = Array.from({ length: 40 }, (_, i) => {
    const t = (i / 40) * Math.PI * 2;
    return [baseC[0] + 135 + Math.cos(t) * 100, baseC[1] + 6 + Math.sin(t) * 24];
  });
  const fill = {
    flat: { l: TONE.white, m: TONE.mid, d: TONE.dark, open: TONE.dark, handle: TONE.dark, shadow: TONE.dark },
    white: { l: TONE.white, m: TONE.white, d: TONE.white, open: TONE.white, handle: TONE.white, shadow: TONE.ground },
  }[mode];
  const clip = `<clipPath id="mug-${id}"><path d="${pathOf(body)}"/></clipPath>`;
  let out = '';
  if (mode === 'smooth') {
    out += `<defs>${clip}<linearGradient id="mg-${id}" x1="${x0}" x2="${x1}" y1="0" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${TONE.white}"/><stop offset="0.35" stop-color="#cfcfcf"/><stop offset="0.7" stop-color="#7d7d7d"/><stop offset="1" stop-color="#454545"/></linearGradient>`
      + `<radialGradient id="ms-${id}"><stop offset="0" stop-color="#2c2c2c"/><stop offset="1" stop-color="#2c2c2c" stop-opacity="0"/></radialGradient></defs>`;
    out += `<ellipse cx="${baseC[0] + 130}" cy="${baseC[1] + 8}" rx="125" ry="30" fill="url(#ms-${id})"/>`;
    out += poly(handle, '#5e5e5e');
    out += `<path d="${pathOf(body)}" fill="url(#mg-${id})"/>`;
    out += `<ellipse cx="${m.cyl.ends[1].cx}" cy="${m.cyl.ends[1].cy}" rx="${m.cyl.ends[1].rx}" ry="${m.cyl.ends[1].ry}" transform="rotate(${m.cyl.ends[1].angle} ${m.cyl.ends[1].cx} ${m.cyl.ends[1].cy})" fill="#4a4a4a"/>`;
    return { svg: out, m, body, bbox: [x0, y0, x1, y1] };
  }
  if (mode === 'outline') {
    const c = 'class="d-ink" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
    const line = (p, q) => `<line class="d-ink" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke-width="2.2" stroke-linecap="round"/>`;
    out += `<path d="${pathOf(body)}" ${c}/>`;
    out += `<path d="${pathOf(handle)}" ${c}/>`;
    out += `<path d="${pathOf(shadow)}" ${c}/>`;
    out += line([a, y0 + 6], [a - 6, y1 - 4]) + line([b, y0 + 6], [b + 4, y1 - 4]);
    out += `<ellipse cx="${m.cyl.ends[1].cx}" cy="${m.cyl.ends[1].cy}" rx="${m.cyl.ends[1].rx}" ry="${m.cyl.ends[1].ry}" transform="rotate(${m.cyl.ends[1].angle} ${m.cyl.ends[1].cx} ${m.cyl.ends[1].cy})" ${c}/>`;
    return { svg: out, m, body, bbox: [x0, y0, x1, y1] };
  }
  out += `<defs>${clip}</defs>`;
  out += poly(shadow, fill.shadow);
  out += poly(handle, fill.handle);
  out += `<g clip-path="url(#mug-${id})"><rect x="${x0 - 2}" y="${y0 - 2}" width="${a - x0 + 2}" height="${y1 - y0 + 4}" fill="${fill.l}"/><rect x="${a}" y="${y0 - 2}" width="${b - a}" height="${y1 - y0 + 4}" fill="${fill.m}"/><rect x="${b}" y="${y0 - 2}" width="${x1 - b + 2}" height="${y1 - y0 + 4}" fill="${fill.d}"/></g>`;
  const e = m.cyl.ends[1];
  out += `<ellipse cx="${e.cx}" cy="${e.cy}" rx="${e.rx}" ry="${e.ry}" transform="rotate(${e.angle} ${e.cx} ${e.cy})" fill="${fill.open}"/>`;
  return { svg: out, m, body, bbox: [x0, y0, x1, y1] };
}

// Put markup at (tx, ty) scaled by s.
export const at = (tx, ty, s, markup) => `<g transform="translate(${tx} ${ty}) scale(${s})">${[markup].flat(Infinity).join('')}</g>`;

// Five chips from white to the darkest tone, as lesson 17's value scale.
export const SCALE = [TONE.white, '#c4c4c4', '#8e8e8e', '#555555', '#171717'];
export function chips(x, y, w, h, gap = 0) {
  return SCALE.map((c, i) => `<rect x="${x + i * (w + gap)}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="#6e6e6e" stroke-width="1"/>`).join('');
}
