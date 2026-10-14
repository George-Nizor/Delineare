// Nose: a centre line, then a flat trapezoid base.
import { head } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  head(kit, { x: 112, y: 108, r: 76, yaw: 28, pitch: 6, layers: ['ball', 'cross', 'plane', 'face', 'jaw', 'ear', 'eyes', 'nose'], width: 2 }),
  kit.text(206, 150, 'centre line,', { size: 12 }), kit.text(206, 168, 'then a flat base', { size: 12 }),);
