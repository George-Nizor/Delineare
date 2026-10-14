// Build the head: the ball, side plane, centre line and face lines, turned to match the photo.
import { head } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  head(kit, { x: 112, y: 108, r: 76, yaw: 28, pitch: 6, layers: ['ball', 'cross', 'plane', 'face', 'jaw', 'ear'], width: 2 }),
  kit.text(206, 84, 'ball and cross', { size: 12 }), kit.text(206, 102, 'side plane', { size: 12 }), kit.text(206, 120, 'face lines', { size: 12 }), kit.text(206, 138, 'jaw', { size: 12 }),);
