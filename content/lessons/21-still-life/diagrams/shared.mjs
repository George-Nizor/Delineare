// A small still life, drawn from real shapes: a box, a cup (cylinder) and a ball on a table, lit
// from the upper left. `scene` draws it in one of four stages. Not a diagram itself.
//
// Local coordinates: the group is about 300 wide and 170 high with the table line at y = 140.

const f = (v) => Number(v.toFixed(2));
const group = (x, y, s, content, flip = false) => `<g transform="translate(${f(x)} ${f(y)}) scale(${flip ? -s : s} ${s})">${content.flat(Infinity).join('')}</g>`;
export const at = (x, y, s, ...content) => group(x, y, s, content);
export const mirrored = (x, y, s, ...content) => group(x, y, s, content, true);

// The parts, as plain geometry. `cup` can be made too short to show a drawing error.
export function parts({ cupHeight = 72, ballShift = 0 } = {}) {
  const box = { x: 12, y: 140, w: 58, h: 60, dx: 18, dy: -9 };
  const cup = { cx: 126, rx: 27, ry: 8, base: 140, height: cupHeight };
  const ball = { cx: 226 + ballShift, cy: 104, r: 36 };
  return { box, cup, ball };
}

const clip = (id, shape) => `<clipPath id="${id}">${shape}</clipPath>`;

// A disc darker than the rest on the side away from the light: the part of the big circle that
// lies outside a smaller-offset circle, clipped to the big circle.
function crescent(id, cx, cy, r, dx, dy, r2, cls) {
  const big = `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>`;
  const d = `M ${f(cx - r)} ${f(cy)} a ${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0 a ${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0 Z M ${f(cx + dx - r2)} ${f(cy + dy)} a ${f(r2)} ${f(r2)} 0 1 0 ${f(2 * r2)} 0 a ${f(r2)} ${f(r2)} 0 1 0 ${f(-2 * r2)} 0 Z`;
  return `<defs>${clip(id, big)}</defs><g clip-path="url(#${id})"><path d="${d}" fill-rule="evenodd" class="${cls}" stroke="none"/></g>`;
}

// stage: 'lines' (just the contours), 'block' (straight-sided blocks and the envelope),
// 'shadows' (contours with one flat dark for the shadows), 'values' (paper, one middle tone, one dark).
// `only` lists the objects to finish ('box', 'cup', 'ball'); the others get a faint contour.
export function scene(kit, stage, { uid = 'a', cupHeight, ballShift, only = ['box', 'cup', 'ball'] } = {}) {
  const { box, cup, ball } = parts({ cupHeight, ballShift });
  const out = [];
  const ink = { width: 2 };
  const faint = { width: 1.4, cls: 'd-guide' };
  const style = (name) => (only.includes(name) ? ink : faint);
  const top = cup.base - cup.height;
  const bx2 = box.x + box.w;
  const by2 = box.y - box.h;

  out.push(kit.line(0, 140, 300, 140, { cls: 'd-guide', width: 1.2 }));

  if (stage === 'block') {
    const left = box.x - 8;
    const high = ball.cy - ball.r - 4;
    out.push(`<rect x="${left}" y="${high}" width="${ball.cx + ball.r + 8 - left}" height="${144 - high}" class="d-mark" fill="none" stroke-width="1.6" stroke-dasharray="6 4" rx="2"/>`);
    out.push(kit.polyline([[box.x, 140], [box.x, by2], [box.x + box.dx, by2 + box.dy], [bx2 + box.dx, by2 + box.dy], [bx2 + box.dx, 140 + box.dy + 4], [bx2, 140], [box.x, 140]], ink));
    out.push(kit.polyline([[cup.cx - cup.rx, 140], [cup.cx - cup.rx, top], [cup.cx + cup.rx, top], [cup.cx + cup.rx, 140], [cup.cx - cup.rx, 140]], ink));
    const c = ball.r * 0.42;
    out.push(kit.polyline([[ball.cx - ball.r, ball.cy - c], [ball.cx - c, ball.cy - ball.r], [ball.cx + c, ball.cy - ball.r], [ball.cx + ball.r, ball.cy - c], [ball.cx + ball.r, ball.cy + c], [ball.cx + c, ball.cy + ball.r], [ball.cx - c, ball.cy + ball.r], [ball.cx - ball.r, ball.cy + c], [ball.cx - ball.r, ball.cy - c]], ink));
    return out;
  }

  const mid = stage === 'values';
  const dark = 'd-fill';
  const half = 'd-fill-soft';
  const shapes = (cls, pts) => `<polygon points="${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}" class="${cls}" stroke="none"/>`;
  const shaded = stage === 'shadows' || stage === 'values';

  if (shaded && only.includes('box')) {
    out.push(shapes('d-lit', [[box.x, 140], [bx2, 140], [bx2, by2], [box.x, by2]]), shapes('d-lit', [[box.x, by2], [box.x + box.dx, by2 + box.dy], [bx2 + box.dx, by2 + box.dy], [bx2, by2]]));
  }
  if (shaded && only.includes('cup')) {
    out.push(`<path d="M ${cup.cx - cup.rx} ${top} L ${cup.cx - cup.rx} 140 A ${cup.rx} ${cup.ry} 0 0 0 ${cup.cx + cup.rx} 140 L ${cup.cx + cup.rx} ${top} Z" class="d-lit"/>`, `<ellipse cx="${cup.cx}" cy="${top}" rx="${cup.rx}" ry="${cup.ry}" class="d-lit"/>`);
  }
  if (shaded && only.includes('ball')) out.push(`<circle cx="${f(ball.cx)}" cy="${f(ball.cy)}" r="${f(ball.r)}" class="d-lit"/>`);
  if (shaded && only.includes('box')) {
    out.push(shapes(dark, [[bx2, 140], [bx2 + box.dx, 140 + box.dy + 4], [bx2 + box.dx + 26, 143], [bx2 + 12, 146]]));
    out.push(shapes(dark, [[bx2, 140], [bx2 + box.dx, 140 + box.dy + 4], [bx2 + box.dx, by2 + box.dy], [bx2, by2]]));
    if (mid) out.push(shapes(half, [[box.x, 140], [bx2, 140], [bx2, by2], [box.x, by2]]));
  }
  if (shaded && only.includes('cup')) {
    out.push(`<ellipse cx="${f(cup.cx + 34)}" cy="143.5" rx="26" ry="5" class="${dark}" stroke="none"/>`);
    const body = `M ${cup.cx - cup.rx} ${top} L ${cup.cx - cup.rx} 140 A ${cup.rx} ${cup.ry} 0 0 0 ${cup.cx + cup.rx} 140 L ${cup.cx + cup.rx} ${top} Z`;
    out.push(`<defs>${clip(`cup${uid}`, `<path d="${body}"/>`)}</defs><g clip-path="url(#cup${uid})">${mid ? `<rect x="${cup.cx - cup.rx + 22}" y="${top}" width="${cup.rx * 2}" height="${cup.height + cup.ry}" class="${half}" stroke="none"/>` : ''}<rect x="${cup.cx + cup.rx - 11}" y="${top}" width="30" height="${cup.height + cup.ry}" class="${dark}" stroke="none"/></g>`);
  }
  if (shaded && only.includes('ball')) {
    out.push(`<ellipse cx="${f(ball.cx + 30)}" cy="143.5" rx="34" ry="5.5" class="${dark}" stroke="none"/>`);
    if (mid) out.push(crescent(`bm${uid}`, ball.cx, ball.cy, ball.r, -15, -16, ball.r, half));
    out.push(crescent(`bd${uid}`, ball.cx, ball.cy, ball.r, -6, -6.5, ball.r, dark));
  }

  out.push(kit.polyline([[box.x, 140], [box.x, by2], [bx2, by2], [bx2, 140], [box.x, 140]], style('box')));
  out.push(kit.polyline([[box.x, by2], [box.x + box.dx, by2 + box.dy], [bx2 + box.dx, by2 + box.dy], [bx2, by2]], style('box')));
  out.push(kit.polyline([[bx2 + box.dx, by2 + box.dy], [bx2 + box.dx, 140 + box.dy + 4], [bx2, 140]], style('box')));
  out.push(kit.ellipse(cup.cx, top, cup.rx, cup.ry, style('cup')));
  out.push(kit.line(cup.cx - cup.rx, top, cup.cx - cup.rx, 140, style('cup')));
  out.push(kit.line(cup.cx + cup.rx, top, cup.cx + cup.rx, 140, style('cup')));
  out.push(kit.path(`M ${cup.cx - cup.rx} 140 A ${cup.rx} ${cup.ry} 0 0 0 ${cup.cx + cup.rx} 140`, style('cup')));
  out.push(kit.circle(ball.cx, ball.cy, ball.r, style('ball')));
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
