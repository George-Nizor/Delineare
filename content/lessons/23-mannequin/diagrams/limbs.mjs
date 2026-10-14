// Attach the limbs: a neck, cylinders for the upper arms and thighs, then the lower arms and legs,
// drawn through where they overlap.
import { mannequin, POSES } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  mannequin(kit, POSES.reach, 28, { x: 120, floor: 220, s: 22, width: 1.8 }),
  kit.text(210, 100, 'limbs are cylinders', { size: 13 }),
  kit.text(210, 118, 'joined to the ovals', { size: 13 }),
);
