// Thumb: a triangular box at its base, a cylinder for the first segment, a wedge for the tip.
import { hand } from './shared.mjs';

const bend = [[8, 12, 8], [10, 14, 10], [12, 16, 12], [9, 13, 9]];
export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  hand(kit, { x: 96, y: 204, s: 84, view: { yaw: 12, pitch: 14 }, layers: ['palm', 'fingers', 'thumb'], flex: bend, mark: ['thumb'], width: 1.7 }),
  kit.text(224, 150, 'triangular box,', { size: 12 }), kit.text(224, 166, 'then a cylinder,', { size: 12 }), kit.text(224, 182, 'then a wedge', { size: 12 }),
);
