// A finished page: a hand built from forms, seen from the back and curled, with its wrist.
import { hand } from './shared.mjs';

const curl = [[10, 14, 10], [12, 16, 12], [14, 18, 14], [10, 14, 10]];
export default (kit) => kit.svg({ width: 540, height: 350 },
  kit.rect(20, 20, 500, 310, { rx: 4 }),
  hand(kit, { x: 150, y: 252, s: 104, view: { yaw: 8, pitch: 10 }, layers: ['wrist', 'palm', 'fingers', 'thumb'], width: 2 }),
  hand(kit, { x: 380, y: 252, s: 104, view: { yaw: 30, pitch: 22 }, layers: ['wrist', 'palm', 'fingers', 'thumb'], flex: curl, width: 2 }),
);
