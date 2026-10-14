// A finished page: three mannequins in different poses, each with its centre line.
import { mannequin, POSES } from './shared.mjs';

export default (kit) => kit.svg({ width: 540, height: 350 },
  kit.rect(20, 20, 500, 310, { rx: 4 }),
  mannequin(kit, POSES.reach, 24, { x: 120, floor: 318, s: 33 }),
  mannequin(kit, POSES.throw, 38, { x: 270, floor: 318, s: 33 }),
  mannequin(kit, POSES.bend, 30, { x: 420, floor: 318, s: 33 }),
);
