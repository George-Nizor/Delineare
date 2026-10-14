// Foreshorten: when the torso points toward you the ovals get shorter and overlap more.
import { mannequin, POSES } from './shared.mjs';

const torso = (rib, pel) => ({ ...POSES.stand, rib: { c: [0, 5.3, 0], ...rib }, pel: { c: [0, 3.95, 0], ...pel } });

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  mannequin(kit, torso({}, {}), 0, { x: 100, floor: 328, s: 46, parts: ['torso', 'centre'], width: 2 }),
  kit.text(100, 202, 'upright', { anchor: 'middle', size: 13 }),
  mannequin(kit, torso({ pitch: 62, c: [0, 5.0, 0.7] }, { pitch: 25, c: [0, 3.95, 0] }), 0, { x: 255, floor: 328, s: 46, parts: ['torso', 'centre'], width: 2 }),
  kit.text(240, 202, 'toward you: shorter, overlapping', { anchor: 'middle', size: 12 }),
);
