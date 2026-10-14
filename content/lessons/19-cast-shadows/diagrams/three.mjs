// Three boxes of different heights on one floor, one sun at 45 degrees: each shadow is as long as its
// box is tall, and all three point the same way.
import { sunScene } from './scenes.js';

export default (kit) => {
  const { out } = sunScene(kit, { f: 280, cy: 64, box: [{ x: -3.3, z: 4.8, w: 0.9, d: 1.0, h: 1.0 }, { x: -1.3, z: 5.6, w: 0.9, d: 1.0, h: 2.0 }, { x: 0.9, z: 4.6, w: 0.9, d: 1.0, h: 1.5 }] });
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 8, 508, 324, { rx: 4 }), out);
};
