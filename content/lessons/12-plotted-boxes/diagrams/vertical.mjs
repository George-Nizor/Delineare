// The first vertical sets the height of the box. A line from its top and one from its bottom go to
// each vanishing point.
import { frame, L0, R0 } from './geom.js';

export default (kit) => {
  const top = [270, 170];
  const bottom = [270, 280];
  return kit.svg({ width: 540, height: 330 }, frame(kit),
    [L0, R0].map((p) => [kit.line(top[0], top[1], p[0], p[1], { cls: 'd-guide', width: 1.6 }), kit.line(bottom[0], bottom[1], p[0], p[1], { cls: 'd-guide', width: 1.6 })]),
    kit.line(top[0], top[1], bottom[0], bottom[1], { width: 2.6 }),
    kit.text(282, 230, 'height', { size: 12 }),
  );
};
