// A finished page: a standing figure on a grid of seven and a half heads, and a second figure
// beside it drawn the same way without the grid.
import { figure, marks } from './shared.mjs';

export default (kit) => {
  const top = 32;
  const unit = 36;
  const out = [kit.rect(20, 20, 500, 310, { rx: 4 })];
  for (let i = 0; i <= 8; i += 1) {
    const h = Math.min(i, 7.5);
    out.push(kit.line(80, top + h * unit, 240, top + h * unit, { cls: 'd-guide', width: 1, dash: i === 8 ? '' : '4 5' }));
  }
  out.splice(out.length - 1, 1);
  out.push(kit.line(80, top + 7.5 * unit, 240, top + 7.5 * unit, { cls: 'd-guide', width: 1, dash: '4 5' }));
  out.push(figure(kit, 160, top, unit));
  out.push(marks(kit, 160, top, unit, [[1, ''], [2, ''], [3, ''], [4, ''], [5.5, '']], { left: 90, right: 230, cls: 'd-mark' }));
  out.push(figure(kit, 380, top, unit));
  out.push(kit.text(160, 316, 'on the grid', { anchor: 'middle', size: 13 }), kit.text(380, 316, 'again, without it', { anchor: 'middle', size: 13 }));
  // Landmarks on the first figure.
  for (const s of [-1, 1]) for (const [dx, h] of [[0.92, 1.42], [0.55, 3.45], [0.4, 5.45]]) out.push(kit.dot(160 + s * dx * unit, top + h * unit, { r: 3, cls: 'd-mark-fill' }));
  return kit.svg({ width: 540, height: 340 }, out);
};
