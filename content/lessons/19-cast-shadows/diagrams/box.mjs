// Step one: a box standing on the floor with its front face square to you, the horizon, and the
// vanishing point its side edges run to.
import { cam, standing } from './cast.js';
import { drawBox } from '../../12-plotted-boxes/diagrams/geom.js';

export default (kit) => {
  const c = cam();
  const s = standing(c, { x: -0.6, z: 4.6 });
  const vp = c.vp([0, 0, 1]);
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 8, 508, 324, { rx: 4 }),
    kit.line(22, c.horizonY, 518, c.horizonY, { cls: 'd-mark', width: 1.4 }), kit.text(30, c.horizonY - 8, 'horizon', { size: 12 }),
    [0, 1, 2, 3].map((i) => kit.line(s.P(i)[0], s.P(i)[1], vp[0], vp[1], { cls: 'd-guide', width: 1, dash: '4 5' })),
    drawBox(kit, s.b, { width: 2.4 }),
    kit.dot(vp[0], vp[1], { r: 4.5, cls: 'd-mark-fill' }), kit.text(vp[0] + 10, vp[1] + 18, 'vanishing point for the side edges', { size: 12 }),
  );
};
