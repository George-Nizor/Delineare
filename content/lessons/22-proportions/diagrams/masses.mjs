// Block in the masses: an oval for the head, one for the ribcage and one for the pelvis, joined
// by a curved spine line.
import { figure } from './shared.mjs';

export default (kit) => {
  const top = 22;
  const unit = 27;
  const x = 140;
  const spine = kit.smooth([[x, top + 1.3 * unit], [x + 5, top + 2.1 * unit], [x + 4, top + 2.9 * unit], [x, top + 3.4 * unit]], { cls: 'd-mark', width: 2.4 });
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 14, 320, 214, { rx: 3 }),
    figure(kit, x, top, unit, { parts: ['masses'] }),
    spine,
    kit.text(196, top + 0.55 * unit + 4, 'head', { size: 13 }),
    kit.text(196, top + 2.0 * unit + 4, 'ribcage', { size: 13 }),
    kit.text(196, top + 3.6 * unit + 4, 'pelvis', { size: 13 }),
    kit.text(196, top + 2.85 * unit + 4, 'spine', { cls: 'd-tag', size: 13 }),
  );
};
