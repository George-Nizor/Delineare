// A finished table of ellipses: rows of circles, of one degree and angle, and ellipses filling the
// pockets under a wavy line, each touching its neighbours and the edges of its box.
import { row } from './shared.mjs';

export default (kit) => {
  const { svg, rect, smooth, handEllipse } = kit;
  const left = 40;
  const top = 34;
  const colW = 230;
  const rowH = 70;
  const boxes = [];
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 2; c += 1) boxes.push([left + c * (colW + 20), top + r * rowH, colW, rowH - 10]);
  }
  const art = [
    row(kit, ...boxes[0], { ratio: 1, seed: 3 }),
    row(kit, ...boxes[1], { ratio: 0.5, seed: 5 }),
    row(kit, ...boxes[2], { ratio: 0.35, angle: 65, seed: 7 }),
    row(kit, ...boxes[3], { ratio: 0.7, angle: -25, seed: 11 }),
    row(kit, ...boxes[4], { ratio: 0.45, angle: -50, seed: 13 }),
    row(kit, ...boxes[5], { ratio: 0.55, angle: 40, seed: 17 }),
  ];
  // The wave rows: a curve through the box, with ellipses in the pockets above and below it.
  for (const [i, [x, y, w, h]] of [[6, boxes[6]], [7, boxes[7]]]) {
    const points = [];
    for (let s = 0; s <= 24; s += 1) {
      const px = x + (s / 24) * w;
      points.push([px, y + h / 2 + Math.sin((s / 24) * Math.PI * 3 + i) * (h * 0.22)]);
    }
    art.push(smooth(points, { width: 1.6 }));
    for (let k = 0; k < 3; k += 1) {
      const px = x + ((k + 0.5) / 3) * w;
      const wave = y + h / 2 + Math.sin(((k + 0.5) / 3) * Math.PI * 3 + i) * (h * 0.22);
      const above = (wave - y) / 2 - 1.5;
      const below = (y + h - wave) / 2 - 1.5;
      if (above > 6) art.push(handEllipse(px, y + above + 1.5, Math.min(above * 1.6, w / 7), above, { seed: 31 + k + i, passes: 2, drift: 1.2, width: 1.5 }));
      if (below > 6) art.push(handEllipse(px, wave + below + 1.5, Math.min(below * 1.6, w / 7), below, { seed: 41 + k + i, passes: 2, drift: 1.2, width: 1.5 }));
    }
  }
  const frames = boxes.map(([x, y, w, h]) => rect(x, y, w, h, { cls: 'd-frame', stroke: 1.4 }));
  return svg({ width: 540, height: 330 },
    rect(16, 14, 508, 302, { rx: 4 }),
    frames, art,
  );
};
