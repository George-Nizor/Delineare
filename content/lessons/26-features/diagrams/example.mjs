// A finished construction: a Loomis head with eyes, nose and mouth placed as forms.
import { head } from './shared.mjs';

export default (kit) => kit.svg({ width: 540, height: 350 },
  kit.rect(20, 20, 500, 310, { rx: 4 }),
  head(kit, { x: 200, y: 170, r: 118, yaw: 26, pitch: 6, layers: ['ball', 'cross', 'plane', 'face', 'jaw', 'ear', 'eyes', 'nose', 'mouth'], width: 2.2 }),
  kit.text(352, 100, 'ball and plane first,', { size: 13 }), kit.text(352, 124, 'then eyes, nose', { size: 13 }), kit.text(352, 148, 'and mouth as small', { size: 13 }), kit.text(352, 172, 'forms on the head', { size: 13 }),
);
