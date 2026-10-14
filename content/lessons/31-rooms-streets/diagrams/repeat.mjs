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

// Step 4: the same steps for three more spots, nearer and farther.
export default (L) => {
  const { svg, rect } = L;
  const spots = [[210, 304], [330, 262], [140, 232], [410, 214]];
  return svg({ width: 520, height: 330 }, rect(6, 6, 508, 318, { rx: 4 }), drawRoom(L, { cls: 'd-guide', width: 1.4 }), drawScale(L, { labels: false }), spots.map(([x, y]) => construct(L, x, y)));
};
