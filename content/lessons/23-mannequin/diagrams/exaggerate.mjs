// Exaggerate: a side tilt makes the centre line a C; a twist makes it an S.
import { mannequin, POSES } from './shared.mjs';

const torso = (rib, pel) => ({ ...POSES.stand, rib: { c: [0, 5.3, 0], ...rib }, pel: { c: [0, 3.95, 0], ...pel } });

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  mannequin(kit, torso({ roll: -22 }, { roll: 14 }), 0, { x: 100, floor: 328, s: 46, parts: ['torso', 'centre'], width: 2 }),
  kit.text(100, 202, 'tilt: a C curve', { anchor: 'middle', size: 13 }),
  mannequin(kit, torso({ twist: 50 }, { twist: -22 }), 0, { x: 255, floor: 328, s: 46, parts: ['torso', 'centre'], width: 2 }),
  kit.text(255, 202, 'twist: an S curve', { anchor: 'middle', size: 13 }),
);
