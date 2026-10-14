// Measure: take one distance as the unit, an eyeball's width, and compare the others with it. Lines
// across the face compare heights.
import { head } from './shared.mjs';

export default (kit) => {
  const x = 116;
  const y = 98;
  const r = 70;
  const bracket = (x1, x2, yy) => [kit.line(x1, yy, x2, yy, { cls: 'd-mark', width: 2 }), kit.line(x1, yy - 5, x1, yy + 5, { cls: 'd-mark', width: 2 }), kit.line(x2, yy - 5, x2, yy + 5, { cls: 'd-mark', width: 2 })];
  const eb = 0.135 * r;
  const cx = 0.3 * r;
  const xs = [x - cx - eb, x - cx + eb, x + cx - eb, x + cx + eb];
  const rows = [[0.13, 'eyes'], [0.5, 'nose'], [0.78, 'mouth'], [1.12, 'chin']];
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 14, 320, 214, { rx: 3 }),
    head(kit, { x, y, r, yaw: 0, pitch: 0, layers: ['ball', 'cross', 'face', 'jaw', 'eyes', 'nose', 'mouth'], width: 1.8 }),
    rows.map(([h, name]) => [kit.line(32, y + h * r, 214, y + h * r, { cls: 'd-mark', width: 1, dash: '5 4' }), kit.text(222, y + h * r + 4, name, { size: 12 })]),
    xs.map((xx) => kit.line(xx, y + 0.13 * r, xx, 196, { cls: 'd-guide', width: 1, dash: '3 4' })),
    bracket(xs[0], xs[1], 200), bracket(xs[1], xs[2], 200), bracket(xs[2], xs[3], 200),
    kit.text(x, 218, 'eye, gap, eye: three equal widths', { anchor: 'middle', size: 11 }),
  );
};
