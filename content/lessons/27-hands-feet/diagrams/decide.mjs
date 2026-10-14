// Decide: choose the view and what each finger is doing before marking the page.
import { hand } from './shared.mjs';

const curl = [[10, 14, 10], [12, 16, 12], [14, 18, 14], [10, 14, 10]];
export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  [['back of the hand', 62, { yaw: 0, pitch: 0 }, 0], ['palm', 180, { yaw: 180, pitch: 0 }, 0], ['fingers curled', 298, { yaw: 30, pitch: 18 }, 1]].map(([name, x, view, c]) => [
    hand(kit, { x, y: 164, s: 40, view, flex: c ? curl : undefined, layers: ['palm', 'fingers'], width: 1.5 }),
    kit.text(x, 206, name, { anchor: 'middle', size: 12 }),
  ]),
);
