// Step four: join the tips with lines that run to the box's own vanishing point, then fill the shape
// with one flat dark tone.
import { sunScene } from './scenes.js';

export default (kit) => {
  const { out, c } = sunScene(kit);
  const vp = c.vp([0, 0, 1]);
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 8, 508, 324, { rx: 4 }), out, kit.dot(vp[0], vp[1], { r: 4.5, cls: 'd-mark-fill' }),
    kit.text(508, 318, 'the shadow runs to the same point as the box', { anchor: 'end', size: 13 }));
};
