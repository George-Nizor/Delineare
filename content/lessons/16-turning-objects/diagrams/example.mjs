// A finished pair of drawings: the same object at two angles, drawn on one eye level with the nearest
// vertical edge the same height and length in both.
import { view, draw } from './turn.js';

export default (kit) => {
  const a = view(45, { cx: 150 });
  const b = view(60, { cx: 400 });
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 10, 508, 320, { rx: 4 }),
    kit.line(22, a.horizon, 518, a.horizon, { cls: 'd-mark', width: 1.3, dash: '6 6' }),
    draw(kit, a, { width: 2.2 }), draw(kit, b, { width: 2.2 }),
  );
};
