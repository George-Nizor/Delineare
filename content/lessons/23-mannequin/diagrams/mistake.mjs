// The usual mistake: the ribcage and pelvis stacked flat and square to the viewer. The right way
// tilts and turns each one, and the centre line shows which way it faces.
import { mannequin, POSES } from './shared.mjs';

const torso = (rib, pel) => ({ ...POSES.stand, rib: { c: [0, 5.3, 0], ...rib }, pel: { c: [0, 3.95, 0], ...pel } });

export default (kit) => kit.svg({ width: 560, height: 230 },
  kit.rect(16, 12, 256, 206, { rx: 3 }),
  kit.tag(144, 30, 'Stacked and flat', { tone: 'bad' }),
  mannequin(kit, torso({}, {}), 0, { x: 144, floor: 330, s: 48, parts: ['torso'], width: 2 }),
  kit.rect(288, 12, 256, 206, { rx: 3 }),
  kit.tag(416, 30, 'Tilted and turned'),
  mannequin(kit, torso({ roll: -14, twist: 34, pitch: 6 }, { roll: 9, twist: -12 }), 0, { x: 416, floor: 330, s: 48, parts: ['torso', 'centre'], width: 2 }),
);
