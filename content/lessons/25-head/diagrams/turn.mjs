// Turn it: set the cross lines first, and the side plane narrows as the head turns away.
import { head } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  [[0, 0, 'front'], [35, 0, 'three-quarter'], [90, 0, 'side'], [35, -28, 'looking up']].map(([yaw, pitch, name], i) => [
    head(kit, { x: 64 + i * 78, y: 112, r: 32, yaw, pitch, layers: ['ball', 'cross', 'plane'], width: 1.8 }),
    kit.text(64 + i * 78, 176, name, { anchor: 'middle', size: 11 }),
  ]),
  kit.text(180, 208, 'cross lines first, then the plane to match', { anchor: 'middle', size: 12 }),
);
