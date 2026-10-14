// Mark landmarks: a dot wherever bone sits at the surface.
import { figure } from './shared.mjs';

export default (kit) => {
  const top = 22;
  const unit = 26;
  const x = 140;
  const dots = [];
  const labels = [];
  const Y = (h) => top + h * unit;
  for (const s of [-1, 1]) {
    dots.push(kit.dot(x + s * 0.28 * unit, Y(1.32), { r: 3.6, cls: 'd-mark-fill' }), kit.dot(x + s * 0.92 * unit, Y(1.42), { r: 3.6, cls: 'd-mark-fill' }));
    dots.push(kit.dot(x + s * 0.55 * unit, Y(3.45), { r: 3.6, cls: 'd-mark-fill' }), kit.dot(x + s * 0.4 * unit, Y(5.45), { r: 3.6, cls: 'd-mark-fill' }), kit.dot(x + s * 0.36 * unit, Y(7.1), { r: 3.6, cls: 'd-mark-fill' }));
  }
  const list = [[0.28, 1.32, 1.0, 'collarbone ends'], [0.92, 1.42, 1.9, 'shoulder tips'], [0.55, 3.45, 3.45, 'front hip points'], [0.4, 5.45, 5.45, 'kneecaps'], [0.36, 7.1, 7.1, 'ankle bones']];
  for (const [dx, h, labelAt, name] of list) {
    labels.push(kit.line(x + dx * unit + 5, Y(h), 226, Y(labelAt), { cls: 'd-guide', width: 1 }), kit.text(230, Y(labelAt) + 4, name, { size: 12 }));
  }
  return kit.svg({ width: 360, height: 240 }, kit.rect(20, 14, 320, 214, { rx: 3 }), figure(kit, x, top, unit, { cls: 'd-guide', width: 1.5 }), dots, labels);
};
