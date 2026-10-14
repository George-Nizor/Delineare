// Fingers: a cylinder for each segment, twelve in all, starting with the pinky and index finger.
import { hand } from './shared.mjs';

const bend = [[8, 12, 8], [10, 14, 10], [12, 16, 12], [9, 13, 9]];
export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  hand(kit, { x: 110, y: 204, s: 84, view: { yaw: 10, pitch: 14 }, layers: ['palm', 'fingers'], flex: bend, mark: ['fingers'], width: 1.8 }),
  kit.text(210, 80, '12 segments,', { size: 12 }), kit.text(210, 96, 'three to a finger', { size: 12 }),
  kit.text(210, 130, 'place the pinky and', { size: 12 }), kit.text(210, 146, 'index first, then fit', { size: 12 }), kit.text(210, 162, 'the middle two', { size: 12 }),
);
