// Step four: move the corners. The face turning away gets shorter and its edges slope more steeply
// towards the horizon, the other face widens and flattens. The first view stays in grey for
// comparison, and both vanishing points slide along the horizon.
import { view, draw } from './turn.js';

export default (kit) => {
  const a = view(45);
  const b = view(60);
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 10, 508, 320, { rx: 4 }),
    kit.line(22, a.horizon, 518, a.horizon, { cls: 'd-mark', width: 1.3, dash: '6 6' }), kit.text(30, a.horizon - 6, 'eye level', { size: 12 }),
    draw(kit, a, { width: 1.8, through: false, cls: 'd-guide' }),
    draw(kit, b, { width: 2.2 }),
    kit.text(480, a.horizon - 12, 'points slide left', { anchor: 'end', size: 12 }),
    kit.text(270, 322, 'grey: the first view', { anchor: 'middle', size: 12 }),
  );
};
