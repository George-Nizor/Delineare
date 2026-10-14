// Ball: a circle, a brow line across its middle and a vertical line for the way it faces.
import { head } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  head(kit, { x: 150, y: 122, r: 82, yaw: 32, pitch: 12, layers: ['ball', 'cross'], width: 2.2 }),
  kit.text(248, 90, 'brow line', { size: 13 }), kit.text(248, 150, 'centre line', { size: 13 }),
);
