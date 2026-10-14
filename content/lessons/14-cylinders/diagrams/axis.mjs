// Step one: a straight axis, ghosted and drawn longer than the cylinder will be.
import { std, along } from './cyl.js';

export default (kit) => {
  const { cyl: c } = std();
  const a = along(c.p0, c.p1, -0.45);
  const b = along(c.p0, c.p1, 1.45);
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }),
    kit.line(a[0], a[1], b[0], b[1], { width: 2.4 }),
    kit.dot(a[0], a[1], { r: 3.4 }), kit.dot(b[0], b[1], { r: 3.4 }),
    kit.text(270, 330, 'longer than the cylinder will be', { anchor: 'middle', size: 13 }),
  );
};
