// Palm: a box about as wide as it is tall, with a curved front plane split into four parts.
import { hand } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  hand(kit, { x: 92, y: 196, s: 118, view: { yaw: 18, pitch: 48 }, layers: ['palm', 'divisions'], width: 2 }),
  kit.text(212, 60, 'front plane, curved:', { size: 12 }), kit.text(212, 76, 'the little-finger side', { size: 12 }), kit.text(212, 92, 'is shorter', { size: 12 }),
  kit.text(212, 130, 'split into four parts,', { size: 12 }), kit.text(212, 146, 'one for each finger', { size: 12 }),
);
