// Step one: the object as you see it, built from forms with its box drawn through.
import { view, draw } from './turn.js';

export default (kit) => {
  const o = view(45);
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 10, 508, 320, { rx: 4 }),
    kit.line(22, o.horizon, 518, o.horizon, { cls: 'd-mark', width: 1.3, dash: '6 6' }), kit.text(30, o.horizon - 6, 'eye level', { size: 12 }),
    draw(kit, o, { width: 2.2 }),
  );
};
