// Helpers for perspective diagrams with people (kept in this file on purpose).
function capsulePts(a, b, r1, r2, n = 8) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); const pts = [];
  for (let i = 0; i <= n; i += 1) { const t = ang - Math.PI / 2 + (Math.PI * i) / n; pts.push([b[0] + r2 * Math.cos(t), b[1] + r2 * Math.sin(t)]); }
  for (let i = 0; i <= n; i += 1) { const t = ang + Math.PI / 2 + (Math.PI * i) / n; pts.push([a[0] + r1 * Math.cos(t), a[1] + r1 * Math.sin(t)]); }
  return pts;
}
// A standing person whose feet are at (x, y) and who is h tall, drawn as a simple mannequin.
function person(L, x, y, h, { cls = 'd-ink', width = null, fill = true } = {}) {
  const { smooth, circle, path } = L;
  const w = width || Math.min(2.2, Math.max(1.1, h / 40));
  const hr = h * 0.068; const out = [];
  const seg = (a, b, r1, r2) => { const c = capsulePts(a, b, r1, r2); const d = `M ${c.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} Z`; out.push(path(d, { cls: 'd-paper', width: 0 }), smooth(c.concat([c[0]]), { cls, width: w, closed: true })); };
  const top = y - h; const sh = y - h * 0.82; const hip = y - h * 0.5; const knee = y - h * 0.26;
  seg([x - h * 0.05, hip], [x - h * 0.06, knee], h * 0.05, h * 0.04); seg([x - h * 0.06, knee], [x - h * 0.05, y], h * 0.04, h * 0.03);
  seg([x + h * 0.05, hip], [x + h * 0.06, knee], h * 0.05, h * 0.04); seg([x + h * 0.06, knee], [x + h * 0.05, y], h * 0.04, h * 0.03);
  seg([x - h * 0.14, sh + h * 0.02], [x - h * 0.17, hip + h * 0.06], h * 0.035, h * 0.028); seg([x + h * 0.14, sh + h * 0.02], [x + h * 0.17, hip + h * 0.06], h * 0.035, h * 0.028);
  seg([x, sh], [x, hip + h * 0.02], h * 0.13, h * 0.1);
  out.push(circle(x, top + hr, hr, { cls, width: w }));
  return out;
}
const SC = { H: 120, VL: [24, 120], VR: [496, 120], O: [400, 120], A: [34, 318], B: [34, 208], cx: 270, bot: 292, top: 28 };
// The height of a person standing on a floor spot at picture height `y`, read off the scale.
function heightAt(y) {
  const { A, B, O } = SC;
  const x = A[0] + ((A[1] - y) * (O[0] - A[0])) / (A[1] - O[1]);
  const top = B[1] + ((O[1] - B[1]) * (x - B[0])) / (O[0] - B[0]);
  return { x, top, h: y - top };
}
// The room corner: two walls meeting at a vertical, floor and ceiling edges running to the vanishing points.
function drawRoom(L, { cls = 'd-ink', width = 2.2 } = {}) {
  const { line, polyline } = L; const { VL, VR, cx, bot, top } = SC;
  const toward = (p, v, x) => [x, p[1] + ((v[1] - p[1]) * (x - p[0])) / (v[0] - p[0])];
  const lb = toward([cx, bot], VL, 92); const rb = toward([cx, bot], VR, 448); const lt = toward([cx, top], VL, 92); const rt = toward([cx, top], VR, 448);
  return [polyline([lt, [cx, top], rt], { cls, width }), polyline([lb, [cx, bot], rb], { cls, width }), line(cx, top, cx, bot, { cls, width }), line(lt[0], lt[1], lb[0], lb[1], { cls, width }), line(rt[0], rt[1], rb[0], rb[1], { cls, width })];
}
// The height scale: A and B at the edge, both joined to O on the horizon.
function drawScale(L, { labels = true } = {}) {
  const { line, dot, text } = L; const { A, B, O, H } = SC;
  const out = [line(14, H, 506, H, { cls: 'd-guide', width: 1.2 }), line(A[0], A[1], O[0], O[1], { cls: 'd-guide', width: 1.3 }), line(B[0], B[1], O[0], O[1], { cls: 'd-guide', width: 1.3 }), line(A[0], A[1], B[0], B[1], { cls: 'd-mark', width: 3 }), dot(O[0], O[1], { r: 4.5, cls: 'd-dot' })];
  if (labels) out.push(text(A[0] + 8, A[1] + 4, 'A', { cls: 'd-tag', size: 14 }), text(B[0] + 8, B[1] - 4, 'B', { cls: 'd-tag', size: 14 }), text(O[0] + 8, O[1] - 6, 'O', { cls: 'd-tag', size: 14 }), text(14, H - 8, 'horizon', { cls: 'd-label', size: 13 }));
  return out;
}
// The construction for one spot: across to the scale, then up between the two lines.
function construct(L, px, py, { person: draw = true } = {}) {
  const { line, dot } = L; const s = heightAt(py);
  const out = [line(px, py, s.x, py, { cls: 'd-mark', width: 1.3, dash: '4 4' }), line(s.x, py, s.x, s.top, { cls: 'd-mark', width: 2.4 }), dot(px, py, { r: 3.2, cls: 'd-dot' })];
  if (draw) out.push(person(L, px, py, s.h));
  return out;
}

// A short label with a paper backing, so lines behind it do not run through the letters.
function tagged(L, x, y, content, { anchor = 'start', size = 13, cls = 'd-label' } = {}) {
  const { rect, text } = L; const w = content.length * size * 0.56 + 8; const x0 = anchor === 'end' ? x - w + 4 : anchor === 'middle' ? x - w / 2 : x - 4;
  return [rect(x0, y - size + 1, w, size + 5, { cls: 'd-paper', rx: 2, stroke: 0 }), text(x, y, content, { cls, anchor, size })];
}
// A street in two-point perspective: two boxes, a floor, people at scaled heights and shadows from a sun
// at 45 degrees in the plane of the picture, to the left. Everything is computed from the vanishing points.
const ST = { H: 130, VL: [-380, 130], VR: [940, 130], A: [24, 330], B: [24, 262], O: [300, 130] };
const toward = (p, v, x) => [x, p[1] + ((v[1] - p[1]) * (x - p[0])) / (v[0] - p[0])];
function boxGeom({ cx, yb, yt, wl, wr }) {
  const bl = toward([cx, yb], ST.VL, cx - wl); const tl = toward([cx, yt], ST.VL, cx - wl); const br = toward([cx, yb], ST.VR, cx + wr); const tr = toward([cx, yt], ST.VR, cx + wr);
  return { b0: [cx, yb], t0: [cx, yt], bl, tl, br, tr };
}
const BOXES = [boxGeom({ cx: 170, yb: 300, yt: 110, wl: 130, wr: 180 }), boxGeom({ cx: 404, yb: 254, yt: 150, wl: 40, wr: 54 })];
const SPOTS = [[150, 322], [262, 298], [330, 278], [500, 272]];
function stHeight(y) { const { A, B, O } = ST; const x = A[0] + ((A[1] - y) * (O[0] - A[0])) / (A[1] - O[1]); const top = B[1] + ((O[1] - B[1]) * (x - B[0])) / (O[0] - B[0]); return { x, top, h: y - top }; }
const polyPath = (L, pts, cls, width = 0) => L.path(`M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} Z`, { cls, width });
function street(L, o = {}) {
  const { line, polyline, dot, text, smooth, ellipse, path } = L;
  const out = [];
  const { horizon = true, boxes = true, ghost = false, scale = false, people = false, shadows = false, rays = false, values = false, ink = 'd-ink', vps = false } = o;
  if (values) out.push(polyPath(L, [[8, 86], [552, 86], [552, 332], [8, 332]], 'd-paper'));
  if (horizon) out.push(line(14, ST.H, 546, ST.H, { cls: 'd-guide', width: 1.2 }));
  if (values) {
    // faces turned away from the sun are middle tone
    BOXES.forEach((b) => out.push(polyPath(L, [b.b0, b.br, b.tr, b.t0], 'd-fill-soft')));
  }
  if (shadows || values) {
    BOXES.forEach((b) => { const s0 = [b.b0[0] + (b.b0[1] - b.t0[1]), b.b0[1]]; const s1 = [b.br[0] + (b.br[1] - b.tr[1]), b.br[1]]; out.push(polyPath(L, [b.b0, b.br, s1, s0], values ? 'd-fill' : 'd-fill-soft')); });
    if (people) SPOTS.forEach(([x, y]) => { const h = stHeight(y).h; out.push(polyPath(L, [[x - 2, y - h * 0.03], [x + h * 0.9, y - h * 0.035], [x + h * 0.98, y], [x + h * 0.9, y + h * 0.035], [x - 2, y + h * 0.03]], values ? 'd-fill' : 'd-fill-soft'), ellipse(x + h * 0.96, y, h * 0.06, h * 0.045, { cls: values ? 'd-fill' : 'd-guide', width: 0 })); });
  }
  if (boxes) BOXES.forEach((b) => {
    if (ghost) out.push(line(b.b0[0], b.b0[1], toward(b.b0, ST.VL, b.bl[0])[0], b.bl[1], { cls: 'd-guide', width: 0 }));
    out.push(polyline([b.bl, b.b0, b.br], { cls: ink, width: 2.2 }), polyline([b.tl, b.t0, b.tr], { cls: ink, width: 2.2 }), line(b.b0[0], b.b0[1], b.t0[0], b.t0[1], { cls: ink, width: 2.2 }), line(b.bl[0], b.bl[1], b.tl[0], b.tl[1], { cls: ink, width: 2.2 }), line(b.br[0], b.br[1], b.tr[0], b.tr[1], { cls: ink, width: 2.2 }));
    if (ghost) { const back = [b.bl[0] + (b.br[0] - b.b0[0]), 0]; }
  });
  if (rays) BOXES.forEach((b) => { const h0 = b.b0[1] - b.t0[1]; out.push(line(b.t0[0], b.t0[1], b.t0[0] + h0, b.b0[1], { cls: 'd-mark', width: 1.8, dash: '5 4' }), dot(b.t0[0] + h0, b.b0[1], { r: 3.6, cls: 'd-dot' })); });
  if (scale) { const { A, B, O } = ST; out.push(line(A[0], A[1], O[0], O[1], { cls: 'd-guide', width: 1.2 }), line(B[0], B[1], O[0], O[1], { cls: 'd-guide', width: 1.2 }), line(A[0], A[1], B[0], B[1], { cls: 'd-mark', width: 3 }), dot(O[0], O[1], { r: 4, cls: 'd-dot' })); }
  if (people) SPOTS.forEach(([x, y]) => { const s = stHeight(y); if (scale) out.push(line(x, y, s.x, y, { cls: 'd-mark', width: 1.1, dash: '4 4' }), line(s.x, y, s.x, s.top, { cls: 'd-mark', width: 2 })); out.push(person(L, x, y, s.h, { cls: ink })); });
  if (rays && people) SPOTS.forEach(([x, y]) => { const h = stHeight(y).h; out.push(line(x, y - h, x + h, y, { cls: 'd-mark', width: 1.5, dash: '5 4' })); });
  return out;
}

// A small flat street thumbnail in three values. cfg: horizon fraction, buildings and people.
const TH = [
  { hz: 0.55, sky: 'light', ground: 'mid', blds: [[0.05, 0.3, 0.7, 'dark'], [0.62, 0.3, 0.45, 'mid']], ppl: [[0.45, 0.28], [0.52, 0.2]] },
  { hz: 0.45, sky: 'mid', ground: 'dark', blds: [[0.02, 0.2, 0.8, 'dark'], [0.72, 0.26, 0.85, 'dark'], [0.3, 0.3, 0.4, 'light']], ppl: [[0.5, 0.3]] },
  { hz: 0.6, sky: 'light', ground: 'light', blds: [[0.35, 0.34, 0.55, 'dark']], ppl: [[0.2, 0.3], [0.75, 0.22], [0.82, 0.16]] },
  { hz: 0.5, sky: 'dark', ground: 'mid', blds: [[0.08, 0.3, 0.6, 'light'], [0.55, 0.36, 0.7, 'light']], ppl: [[0.46, 0.3]] },
  { hz: 0.62, sky: 'light', ground: 'mid', blds: [[0.0, 0.5, 0.5, 'mid'], [0.62, 0.38, 0.75, 'dark']], ppl: [[0.3, 0.34], [0.52, 0.22]] },
  { hz: 0.4, sky: 'mid', ground: 'light', blds: [[0.12, 0.76, 0.3, 'dark']], ppl: [[0.4, 0.34], [0.55, 0.26], [0.66, 0.2]] },
];
function streetThumb(L, x, y, w, h, i) {
  const { rect, ellipse } = L; const c = TH[i]; const V = { dark: 'd-fill', mid: 'd-fill-soft', light: 'd-paper' };
  const hz = y + h * c.hz; const out = [rect(x, y, w, h, { cls: V[c.sky], stroke: 0 }), rect(x, hz, w, y + h - hz, { cls: V[c.ground], stroke: 0 })];
  c.blds.forEach(([bx, bw, bh, v]) => { const top = hz - h * bh * 0.7; out.push(rect(x + w * bx, top, w * bw, hz - top + 4, { cls: V[v], stroke: 0 })); });
  c.ppl.forEach(([px, ph]) => { const ph2 = h * ph * 0.95; const cx = x + w * px; const base = y + h * (0.82 - ph * 0.3); out.push(rect(cx - ph2 * 0.09, base - ph2 * 0.8, ph2 * 0.18, ph2 * 0.8, { cls: 'd-fill', stroke: 0 }), ellipse(cx, base - ph2 * 0.9, ph2 * 0.1, ph2 * 0.1, { cls: 'd-fill', width: 0 }), ellipse(cx + ph2 * 0.5, base + 1, ph2 * 0.5, ph2 * 0.05, { cls: 'd-fill', width: 0 })); });
  out.push(rect(x, y, w, h, { cls: 'd-frame', stroke: 1.6 }));
  return out;
}

// Step 3: the height scale gives each person's height at their spot on the street.
export default (L) => {
  const { svg, rect, group } = L;
  return svg({ width: 560, height: 262 }, rect(6, 6, 548, 250, { rx: 4 }), group({ translate: [0, -78] }, street(L, { scale: true, people: true, ink: 'd-ink' })));
};
