// Pick an object: a plain mug, as it looks on a desk.
import { mug, parts } from './mug.js';

export default (kit) => {
  const m = mug();
  const p = parts(kit, m, { through: false, width: 2.6 });
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }), p.body, p.handle,
    kit.text(270, 338, 'a plain object, with its details ignored', { anchor: 'middle', size: 13 }));
};
