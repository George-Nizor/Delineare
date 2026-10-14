// Face lines: a centre line, then hairline, brow, nose and chin in equal steps.
import { head } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  head(kit, { x: 150, y: 112, r: 76, yaw: 32, pitch: 8, layers: ['ball', 'cross', 'plane', 'face'], width: 2 }),
  [['hairline', 80], ['brow', 112], ['nose', 160], ['chin', 206]].map(([name, y]) => kit.text(252, y, name, { size: 12 })),
  kit.text(252, 52, 'equal steps', { cls: 'd-tag', size: 12 }),
);
