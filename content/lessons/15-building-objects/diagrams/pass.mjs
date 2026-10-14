// Add a pass: smaller forms attached to what is already there, here the thickness of the rim and the
// foot ring. They sit on the body, so they are drawn on top of it.
import { mug, parts } from './mug.js';

export default (kit) => {
  const m = mug();
  const p = parts(kit, m, { through: true, width: 2.2 });
  const rim = kit.smooth(m.rimInner, { width: 2.4, closed: true, cls: 'd-mark' });
  const foot = p.foot;
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }), p.body, p.handle, p.joins,
    rim, foot.map((f) => f),
    kit.text(32, 300, 'new forms rest', { size: 12 }), kit.text(32, 316, 'on the old ones', { size: 12 }));
};
