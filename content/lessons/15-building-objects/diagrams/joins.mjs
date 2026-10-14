// Draw the joins: where the handle meets the body, an oval that lies on the surface of both forms.
import { mug, parts } from './mug.js';

export default (kit) => {
  const m = mug();
  const p = parts(kit, m, { through: true, width: 2.2 });
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }), p.body, p.handle, p.joins,
    kit.text(32, 300, 'each join sits', { size: 12 }), kit.text(32, 316, 'on both forms', { size: 12 }));
};
