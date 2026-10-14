// A lighthouse in three values, as a thumbnail. Each layout is one arrangement of the same subject.
const VAL = { dark: 'd-fill', mid: 'd-fill-soft', light: 'd-paper' };
const fillShape = (L, pts, v, outline = false) => L.path(`M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} Z`, outline ? { cls: 'd-ink', width: 2, fill: 'none' } : { cls: VAL[v], width: 0 });
const LAYOUTS = [
  { hz: 0.64, bx: 0.5, s: 1.0, sky: 'light', sea: 'mid', rock: 'dark', tower: 'dark' },
  { hz: 0.72, bx: 0.3, s: 1.25, sky: 'mid', sea: 'dark', rock: 'dark', tower: 'light' },
  { hz: 0.5, bx: 0.7, s: 0.7, sky: 'dark', sea: 'mid', rock: 'light', tower: 'light' },
  { hz: 0.8, bx: 0.42, s: 1.55, sky: 'light', sea: 'light', rock: 'dark', tower: 'dark' },
  { hz: 0.42, bx: 0.5, s: 0.62, sky: 'light', sea: 'dark', rock: 'mid', tower: 'dark' },
  { hz: 0.6, bx: 0.76, s: 1.0, sky: 'mid', sea: 'light', rock: 'dark', tower: 'dark' },
];
function thumb(L, x, y, w, h, layout, { detail = false, outline = false } = {}) {
  const { rect, line } = L; const t = typeof layout === 'number' ? LAYOUTS[layout] : layout;
  const hzY = y + h * t.hz; const by = y + h * Math.min(0.9, t.hz + 0.1); const bx = x + w * t.bx; const sw = w * t.s;
  const ty = Math.max(y + h * 0.05, by - h * 0.62 * t.s);
  const clampX = (v) => Math.max(x + 2, Math.min(x + w - 2, v));
  const out = outline ? [] : [fillShape(L, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], t.sky), fillShape(L, [[x, hzY], [x + w, hzY], [x + w, y + h], [x, y + h]], t.sea)];
  if (outline) out.push(line(x, hzY, x + w, hzY, { width: 2 }));
  out.push(fillShape(L, [[clampX(bx - 0.3 * sw), y + h], [clampX(bx - 0.17 * sw), by], [clampX(bx + 0.2 * sw), by], [clampX(bx + 0.34 * sw), y + h]], t.rock, outline));
  out.push(fillShape(L, [[clampX(bx - 0.065 * sw), by], [clampX(bx + 0.065 * sw), by], [clampX(bx + 0.037 * sw), ty], [clampX(bx - 0.037 * sw), ty]], t.tower, outline));
  out.push(fillShape(L, [[clampX(bx - 0.05 * sw), ty], [clampX(bx + 0.05 * sw), ty], [clampX(bx), ty - h * 0.05 * t.s]], t.tower === 'dark' ? 'dark' : 'light', outline));
  if (detail) {
    for (let i = 0; i < 9; i += 1) out.push(line(x + 4, hzY + 4 + i * ((y + h - hzY - 8) / 9), x + w - 4, hzY + 4 + i * ((y + h - hzY - 8) / 9) + 2, { width: 1 }));
    for (let i = 0; i < 5; i += 1) out.push(rect(bx - 3, ty + 8 + i * (by - ty) / 6, 6, 5, { cls: 'd-paper', stroke: 1 }));
  }
  out.push(rect(x, y, w, h, { cls: 'd-frame', stroke: 1.6 }));
  return out;
}
// Tone is judged against a neutral grey in both themes, so this diagram uses fixed greys and never
// follows the light or dark theme. Every theme class is turned into a fixed inline style.
function fixed(markup) {
  const STYLE = {
    'd-ink': 'stroke:#161616', 'd-guide': 'stroke:#8c8c8c', 'd-bad': 'stroke:#a2482a', 'd-dot': 'fill:#161616',
    'd-frame': 'fill:none;stroke:#161616', 'd-fill': 'fill:#161616;stroke:none', 'd-fill-soft': 'fill:#9a9a9a;stroke:none',
    'd-label': 'fill:#3a3a3a', 'd-tag': 'fill:#5a6000', 'd-tag-bad': 'fill:#a2482a', 'd-mark': 'stroke:#5a6000',
  };
  const order = ['d-ink', 'd-guide', 'd-bad', 'd-dot', 'd-frame', 'd-fill', 'd-fill-soft', 'd-label', 'd-tag', 'd-tag-bad', 'd-mark'];
  return markup.replace(/<(rect|path|line|circle|ellipse|text)([^>]*?) class="([^"]*)"/g, (whole, tag, attrs, classes) => {
    const tokens = classes.split(/\s+/);
    const parts = [];
    if (tokens.includes('d-paper')) parts.push(tag === 'rect' ? 'fill:#b4b4b4;stroke:#8a8a8a' : 'fill:#f4f4f4');
    order.forEach((t) => { if (tokens.includes(t)) parts.push(STYLE[t]); });
    return `<${tag}${attrs} style="${parts.join(';')}"`;
  }).replace('class="diagram-svg"', 'class="diagram-svg"');
}

// A finished page: six thumbnails of one subject, each arranged differently, with one chosen.
const body = (L) => {
  const { svg, rect } = L;
  const out = [rect(8, 8, 544, 314, { rx: 4 })];
  [2, 0, 5, 3, 1, 4].forEach((k, i) => out.push(thumb(L, 36 + (i % 3) * 176, 36 + Math.floor(i / 3) * 140, 156, 120, k)));
  out.push(L.rect(204, 28, 172, 136, { cls: 'd-frame', rx: 8, stroke: 3 }).replace('class="d-frame"', 'class="d-frame d-mark"'));
  return svg({ width: 560, height: 330 }, out);
};
export default (L) => fixed(body(L));
