// Helpers for this lesson's figure diagrams (kept in this file on purpose).
const J = {
  head: [210, 58], neck: [210, 90],
  shL: [166, 118], shR: [254, 118],
  elL: [112, 78], wrL: [96, 26],          // raised arm (left of the page)
  elR: [276, 188], wrR: [268, 252],       // lowered arm
  hipL: [190, 262], hipR: [230, 262],
  knL: [186, 356], anL: [184, 452],       // straight leg
  knR: [268, 350], anR: [244, 446],       // bent knee
};
function capsule(a, b, r1, r2, n = 12) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const pts = [];
  for (let i = 0; i <= n; i += 1) { const t = ang - Math.PI / 2 + (Math.PI * i) / n; pts.push([b[0] + r2 * Math.cos(t), b[1] + r2 * Math.sin(t)]); }
  for (let i = 0; i <= n; i += 1) { const t = ang + Math.PI / 2 + (Math.PI * i) / n; pts.push([a[0] + r1 * Math.cos(t), a[1] + r1 * Math.sin(t)]); }
  return pts;
}
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
// The mannequin as plain forms: head, ribcage, pelvis and tapered limb segments.
function mannequin(L, { cls = 'd-guide', width = 1.8, dx = 0, dy = 0 } = {}) {
  const { smooth, ellipse, circle, group } = L;
  const mv = (p) => [p[0] + dx, p[1] + dy];
  const seg = (a, b, r1, r2) => smooth(capsule(mv(a), mv(b), r1, r2).concat([capsule(mv(a), mv(b), r1, r2)[0]]), { cls, width, closed: true });
  return [
    circle(J.head[0] + dx, J.head[1] + dy, 24, { cls, width }),
    ellipse(210 + dx, 164 + dy, 50, 54, { cls, width }),
    ellipse(210 + dx, 246 + dy, 44, 30, { cls, width }),
    seg(J.shL, J.elL, 12, 9), seg(J.elL, J.wrL, 9, 6),
    seg(J.shR, J.elR, 12, 9), seg(J.elR, J.wrR, 9, 6),
    seg(J.hipL, J.knL, 19, 12), seg(J.knL, J.anL, 12, 8),
    seg(J.hipR, J.knR, 19, 12), seg(J.knR, J.anR, 12, 8),
  ];
}
// Clothing as tubes wrapped round the same forms, a little wider. Drawn back to front with a paper
// fill, so the outline of each piece hides what is behind it.
function clothes(L, { cls = 'd-ink', width = 2.2, pad = 8 } = {}) {
  const { smooth, path, circle, ellipse } = L;
  const piece = (pts) => [path(`M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} Z`, { cls: 'd-paper', width: 0 }), smooth(pts.concat([pts[0]]), { cls, width, closed: true })];
  const seg = (a, b, r1, r2) => piece(capsule(a, b, r1 + pad, r2 + pad));
  const torso = [[166, 106], [190, 98], [230, 98], [254, 106], [264, 150], [262, 200], [256, 240], [250, 264], [170, 264], [164, 240], [158, 200], [160, 150]];
  const waist = [[168, 250], [252, 250], [254, 282], [244, 296], [210, 288], [176, 296], [166, 282]];
  return [
    seg(J.hipL, J.knL, 19, 12), seg(J.knL, J.anL, 12, 8), seg(J.hipR, J.knR, 19, 12), seg(J.knR, J.anR, 12, 8),
    ellipse(J.anL[0] - 6, J.anL[1] + 14, 20, 8, { cls, width }), ellipse(J.anR[0] + 10, J.anR[1] + 12, 20, 8, { cls, width, angle: -14 }),
    seg(J.shL, J.elL, 12, 9), seg(J.elL, J.wrL, 9, 6), circle(J.wrL[0] - 2, J.wrL[1] - 10, 9, { cls, width }),
    seg(J.shR, J.elR, 12, 9), seg(J.elR, J.wrR, 9, 6), circle(J.wrR[0], J.wrR[1] + 10, 9, { cls, width }),
    piece(waist), piece(torso),
    circle(J.head[0], J.head[1], 24, { cls, width }),
  ];
}
// The folds on the dressed figure: each group starts at a tension point.
function foldSet(L) {
  const { smooth } = L;
  const f = (pts, w = 1.9) => smooth(pts, { cls: 'd-ink', width: w });
  return [
    // raised shoulder pulls the shirt up and across the chest
    f([[168, 124], [182, 144], [192, 170]]), f([[168, 126], [178, 156], [182, 190]]), f([[168, 130], [170, 168], [170, 204]]),
    // inside of the raised elbow: cloth squeezed into chevrons
    f([[110, 92], [118, 86], [126, 94]], 1.7), f([[102, 104], [112, 98], [122, 108]], 1.7), f([[96, 58], [104, 52], [112, 60]], 1.6),
    // lowered shoulder and elbow
    f([[252, 126], [248, 150], [252, 176]]), f([[262, 190], [270, 196], [280, 192]], 1.7), f([[264, 200], [272, 206], [282, 202]], 1.7),
    // belt: the shirt hangs from it
    f([[178, 256], [182, 232], [190, 210]]), f([[186, 258], [198, 236], [212, 216]]), f([[170, 256], [172, 230], [174, 206]]),
    // trousers hang from the hips
    f([[196, 270], [192, 308], [190, 342]]), f([[210, 270], [208, 312], [204, 346]]), f([[220, 272], [226, 308], [236, 336]]),
    // bent knee: cloth squeezed in at the front of the joint
    f([[254, 340], [268, 346], [282, 340]], 1.7), f([[250, 330], [266, 336], [284, 330]], 1.7), f([[258, 366], [268, 358], [278, 366]], 1.7),
    // straight knee and the shins
    f([[176, 352], [186, 356], [196, 352]], 1.7), f([[188, 372], [188, 410], [186, 440]]), f([[248, 372], [246, 408], [244, 436]]),
  ];
}

// Tension points: the places where the body holds, pushes or pulls the cloth.
export default (L) => {
  const { svg, rect, text, dot } = L;
  const pts = [
    [J.shL, 'shoulder', 'end', [-18, 34]], [J.elL, 'elbow', 'end', [-16, 28]], [J.shR, 'shoulder', 'start', [18, -14]],
    [J.elR, 'elbow', 'start', [20, 6]], [[176, 262], 'belt', 'end', [-18, 6]], [J.knR, 'knee', 'start', [28, 6]], [J.knL, 'knee', 'end', [-28, 6]],
  ];
  return svg({ width: 380, height: 490 }, rect(10, 10, 360, 470, { rx: 4 }), clothes(L, { cls: 'd-ink', width: 1.8 }),
    pts.map(([p, label, anchor, off]) => [dot(p[0], p[1], { r: 5.5, cls: 'd-dot' }), text(p[0] + off[0], p[1] + off[1], label, { cls: 'd-label', anchor, size: 14 })]));
};
