// Build them: the main forms, each drawn through. The cylinder's far side and the back of its base
// show, and so do both edges of the handle.
import { mug, parts } from './mug.js';

export default (kit) => {
  const m = mug();
  const p = parts(kit, m, { through: true, width: 2.2 });
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }), p.axis, p.body, p.handle);
};
