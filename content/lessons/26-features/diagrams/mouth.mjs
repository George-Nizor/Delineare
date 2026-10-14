// Mouth: wrapped round the front of the jaw, the far corner shorter.
import { head } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  head(kit, { x: 112, y: 108, r: 76, yaw: 28, pitch: 6, layers: ['ball', 'cross', 'plane', 'face', 'jaw', 'ear', 'eyes', 'nose', 'mouth'], width: 2 }),
  kit.text(206, 170, 'wraps round', { size: 12 }), kit.text(206, 188, 'the jaw, far corner', { size: 12 }), kit.text(206, 206, 'is shorter', { size: 12 }),);
