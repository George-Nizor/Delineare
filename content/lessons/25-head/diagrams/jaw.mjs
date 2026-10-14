// Jaw: from the side plane down to the chin, squared off, then back along the near side.
import { head } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  head(kit, { x: 150, y: 108, r: 82, yaw: 32, pitch: 8, layers: ['ball', 'cross', 'plane', 'face', 'jaw', 'ear'], width: 2 }),
  kit.text(250, 206, 'jaw and chin', { size: 13 }), kit.text(250, 150, 'ear', { size: 13 }),
);
