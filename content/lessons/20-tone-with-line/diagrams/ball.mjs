// Shade a ball: curved hatching that follows the roundness, lit side left as paper, more layers
// toward the shadow side.
import { hatchedBall, tonal } from './shared.mjs';

const build = (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 20, 320, 200, { rx: 3 }),
  hatchedBall(kit, 150, 124, 72),
  kit.arcArrow(48, 48, 82, 76, { lift: 10 }),
  kit.text(46, 42, 'light', { anchor: 'start', size: 13 }),
  kit.text(236, 160, 'lines curve', { anchor: 'start', size: 12 }), kit.text(236, 176, 'round the form', { anchor: 'start', size: 12 }),
);

export default (kit) => tonal(build(kit));
