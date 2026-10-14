// Step three: find the tips. From the top of each right-hand vertical edge a ray runs down at 45
// degrees. From the base of the same edge a floor line runs sideways. They meet at the tip of that
// edge's shadow.
import { cam, standing, sunShadow } from './cast.js';
import { drawBox } from '../../12-plotted-boxes/diagrams/geom.js';

export default (kit) => {
  const c = cam();
  const s = standing(c, { x: -1.9, z: 4.6 });
  const sh = sunShadow(c, s);
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 8, 508, 324, { rx: 4 }),
    kit.line(22, c.horizonY, 518, c.horizonY, { cls: 'd-mark', width: 1.2, dash: '5 5' }),
    drawBox(kit, s.b, { width: 2.4 }),
    sh.right.map((r) => [kit.line(r.base[0], r.base[1], r.tip[0] + 14, r.tip[1], { cls: 'd-guide', width: 1.6 }), kit.line(r.top[0], r.top[1], r.tip[0], r.tip[1], { cls: 'd-mark', width: 2 }), kit.dot(r.tip[0], r.tip[1], { r: 4.2, cls: 'd-mark-fill' })]),
    kit.text(480, 318, 'ray from the top, floor line from the base: they meet at the tip', { anchor: 'end', size: 13 }),
  );
};
