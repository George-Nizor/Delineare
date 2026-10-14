// Bean: the ribcage and the pelvis as two overlapping ovals with a centre line through both.
import { mannequin, POSES } from './shared.mjs';

export default (kit) => {
  const pose = { ...POSES.stand, rib: { c: [0.15, 5.3, 0], roll: -10, twist: 22, pitch: 0 }, pel: { c: [0, 3.95, 0], roll: 5, twist: -8 } };
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 14, 320, 214, { rx: 3 }),
    mannequin(kit, pose, 0, { x: 130, floor: 404, s: 62, parts: ['torso', 'centre'], width: 2.2 }),
    kit.text(222, 70, 'ribcage', { size: 14 }),
    kit.text(222, 106, 'overlap at the waist', { size: 13 }),
    kit.text(222, 150, 'pelvis', { size: 14 }),
    kit.text(222, 190, 'centre line', { cls: 'd-tag', size: 13 }),
  );
};
