// Wrist: a narrower box, with a small step down from the forearm to the hand.
import { hand } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  hand(kit, { x: 100, y: 136, s: 58, view: { yaw: 58, pitch: 6 }, layers: ['forearm', 'palm', 'wrist', 'fingers'], flex: [[4, 6, 4], [5, 7, 5], [6, 8, 6], [4, 6, 4]], mark: ['wrist'], width: 1.7 }),
  kit.text(200, 130, 'a narrower box,', { size: 12 }), kit.text(200, 146, 'a small step down', { size: 12 }), kit.text(200, 162, 'from the forearm', { size: 12 }),
);
