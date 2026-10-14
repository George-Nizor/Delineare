// A horse seen from the side, built in the stages the lesson teaches. Kept in this file on purpose.
function capsule(a, b, r1, r2, n = 10) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); const pts = [];
  for (let i = 0; i <= n; i += 1) { const t = ang - Math.PI / 2 + (Math.PI * i) / n; pts.push([b[0] + r2 * Math.cos(t), b[1] + r2 * Math.sin(t)]); }
  for (let i = 0; i <= n; i += 1) { const t = ang + Math.PI / 2 + (Math.PI * i) / n; pts.push([a[0] + r1 * Math.cos(t), a[1] + r1 * Math.sin(t)]); }
  return pts;
}
// stages: which parts to draw. head scales the head, len stretches the body (1 = Bourgelat's horse,
// a body length of two and a half heads).
function horse(L, { ox = 0, oy = 0, head = 1, len = 1, barrel = true, ovals = false, headOn = false, legs = false, labels = false, measure = false, cls = 'd-ink', guide = 'd-guide', width = 2.2 } = {}) {
  const { smooth, ellipse, line, text, dot, path } = L;
  const P = (x, y) => [ox + x, oy + y];
  const chest = 110; const L0 = 150 * len; const butt = chest + L0; const mid = chest + L0 / 2;
  const out = [];
  out.push(line(ox + chest - 90, oy + 300, ox + butt + 70, oy + 300, { cls: guide, width: 1.4 }));
  if (barrel) {
    const pts = [P(chest + 14, 154), P(chest + 36, 149), P(mid - 10, 156), P(mid + 30, 158), P(butt - 30, 148), P(butt - 2, 154), P(butt + 5, 176), P(butt - 2, 200), P(butt - 30, 210), P(mid + 20, 218), P(chest + 48, 224), P(chest + 8, 214), P(chest - 5, 194), P(chest - 4, 170)];
    out.push(smooth(pts, { cls, width, closed: true }));
  }
  if (ovals) {
    out.push(ellipse(ox + chest + L0 * 0.25, oy + 184, L0 * 0.25, 34, { cls: guide, width: 1.8 }), ellipse(ox + butt - L0 * 0.125, oy + 184, 20, 29, { cls: guide, width: 1.8, angle: 22 }));
  }
  if (headOn) {
    const hl = 60 * head; const pl = [chest - 6, 110]; const mz = [pl[0] - hl * 0.34, pl[1] + hl * 0.94];
    const hc = capsule(P(pl[0] - hl * 0.06, pl[1] + hl * 0.18), P(mz[0] + 2, mz[1] - 4), 16 * Math.sqrt(head), 8 * Math.sqrt(head), 10);
    out.push(smooth(hc.concat([hc[0]]), { cls, width, closed: true }));
    const nk = capsule(P(chest + 34, 176), P(pl[0] + 2, pl[1] + 8), 30, 12, 10);
    out.push(smooth(nk.concat([nk[0]]), { cls: guide, width: 1.8, closed: true }));
    out.push({ hl, pl, mz });
  }
  if (legs) {
    const front = [[chest + 16, 178], [chest + 30, 214], [chest + 24, 254], [chest + 20, 284]];
    const hind = [[butt - 14, 182], [butt - 34, 224], [butt - 6, 258], [butt - 10, 286]];
    const radii = [[13, 9], [9, 7], [7, 6]];
    [front, hind].forEach((j) => { for (let i = 0; i < 3; i += 1) { const c = capsule(P(...j[i]), P(...j[i + 1]), radii[i][0], radii[i][1]); out.push(smooth(c.concat([c[0]]), { cls, width: width - 0.3, closed: true })); } out.push(ellipse(ox + j[3][0] + 4, oy + 296, 12, 6, { cls, width: 2 })); });
    if (labels) {
      [[front[0], 'shoulder', 'end', [-30, 6]], [front[1], 'elbow', 'end', [-18, 6]], [front[2], 'wrist', 'end', [-14, 4]], [hind[0], 'hip', 'start', [26, -14]], [hind[1], 'knee', 'end', [-18, 20]], [hind[2], 'ankle', 'start', [16, 6]]].forEach(([p, name, anchor, off]) => out.push(dot(ox + p[0], oy + p[1], { r: 4.5, cls: 'd-dot' }), text(ox + p[0] + off[0], oy + p[1] + off[1], name, { cls: 'd-label', anchor, size: 13 })));
    }
  }
  return out;
}

// Step 2: a big oval for the ribcage over the front half, a smaller slanted one for the pelvis over the back quarter.
export default (L) => {
  const { svg, rect, line, text } = L;
  const ox = -17; const oy = -80; const chest = 110; const butt = 260;
  const bracket = (x1, x2, y, label) => [line(ox + x1, oy + y, ox + x2, oy + y, { cls: 'd-mark', width: 2 }), line(ox + x1, oy + y - 5, ox + x1, oy + y + 5, { cls: 'd-mark', width: 2 }), line(ox + x2, oy + y - 5, ox + x2, oy + y + 5, { cls: 'd-mark', width: 2 }), text((ox + x1 + ox + x2) / 2, oy + y + 20, label, { cls: 'd-tag', anchor: 'middle', size: 14 })];
  return svg({ width: 360, height: 262 }, rect(4, 4, 352, 254, { rx: 4 }), horse(L, { ox, oy, ovals: true }), bracket(chest, chest + 75, 246, 'half'), bracket(butt - 37.5, butt, 246, 'quarter'));
};
