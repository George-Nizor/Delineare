// Step two: place the sun. Its rays are parallel and, here, in the picture plane at 45 degrees up,
// so on the page they are parallel lines at 45 degrees. A shadow on the floor is as long as the box
// is tall.
import { cam, standing } from './cast.js';
import { drawBox } from '../../12-plotted-boxes/diagrams/geom.js';

export default (kit) => {
  const c = cam();
  const s = standing(c, { x: -0.6, z: 4.6 });
  const ray = (x, y) => [kit.line(x, y, x + 70, y + 70, { cls: 'd-mark', width: 2 }), kit.line(x + 70, y + 70, x + 57, y + 68, { cls: 'd-mark', width: 2 }), kit.line(x + 70, y + 70, x + 68, y + 57, { cls: 'd-mark', width: 2 })];
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 8, 508, 324, { rx: 4 }),
    kit.line(22, c.horizonY, 518, c.horizonY, { cls: 'd-mark', width: 1.2, dash: '5 5' }),
    drawBox(kit, s.b, { width: 2.4 }),
    kit.circle(58, 40, 18, { width: 2.4 }),
    ray(86, 54), ray(120, 90), ray(48, 100),
    kit.text(92, 32, 'sun: 45 degrees up, level with the picture', { size: 12 }),
    kit.text(508, 318, 'the shadow will be as long as the box is tall', { anchor: 'end', size: 13 }),
  );
};
