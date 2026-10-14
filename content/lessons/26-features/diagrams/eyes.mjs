// Eyes: a trapezoid socket let into the face, a sphere in each, one eyeball's width apart.
import { head } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  head(kit, { x: 112, y: 108, r: 76, yaw: 28, pitch: 6, layers: ['ball', 'cross', 'plane', 'face', 'jaw', 'ear', 'eyes'], width: 2 }),
  kit.text(206, 100, 'socket: a trapezoid', { size: 12 }), kit.text(206, 118, 'eyeballs: spheres', { size: 12 }), kit.text(206, 136, 'an eyeball apart', { size: 12 }),);
