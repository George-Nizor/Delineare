// Step one: a ball on paper with one lamp to the side, and the shadow it throws away from the lamp.
import { sphere, polyd } from './shade.js';

export default (kit) => {
  const s = sphere({ cx: 290, cy: 175, R: 70 });
  const bulb = [74, 82];
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 8, 508, 324, { rx: 4 }),
    kit.path(polyd(s.shadow()), { cls: 'd-guide', width: 1.6, dash: '5 5' }),
    kit.circle(s.cx, s.cy, s.R, { width: 2.4 }),
    kit.line(bulb[0], bulb[1] + 16, bulb[0], bulb[1] + 80, { width: 3 }), kit.line(bulb[0] - 22, bulb[1] + 80, bulb[0] + 22, bulb[1] + 80, { width: 3 }),
    kit.circle(bulb[0], bulb[1], 16, { width: 2.4 }),
    [[-22, 6], [12, 22], [24, -10]].map(([dx, dy]) => kit.line(bulb[0] + 26, bulb[1] + 4 + dy * 0.2, 214 + dx, 128 + dy, { cls: 'd-mark', width: 1.5, dash: '5 5' })),
    kit.text(bulb[0], bulb[1] - 28, 'one lamp, to one side', { anchor: 'middle', size: 13 }),
    kit.text(400, 306, 'its shadow falls away from the lamp', { anchor: 'middle', size: 13 }),
  );
};
