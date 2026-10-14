// Step three: keep what stays. The eye level is the same line, and the nearest vertical edge has the
// same height and length in both views.
import { view, draw } from './turn.js';

export default (kit) => {
  const a = view(45, { cx: 150 });
  const b = view(60, { cx: 400 });
  const edge = (o, x) => kit.line(o.near[0], o.near[1], o.nearTop[0], o.nearTop[1], { cls: 'd-mark', width: 4 });
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 10, 508, 320, { rx: 4 }),
    kit.line(22, a.horizon, 518, a.horizon, { cls: 'd-mark', width: 1.3, dash: '6 6' }), kit.text(30, a.horizon - 6, 'same eye level', { size: 12 }),
    draw(kit, a, { width: 2 }), draw(kit, b, { width: 2 }), edge(a), edge(b),
    kit.text(270, 322, 'the nearest vertical edge: same length, same height', { anchor: 'middle', size: 13 }),
  );
};
