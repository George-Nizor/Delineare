// Side plane: a flat slice cut off the side of the ball, an ellipse inside the circle.
import { head } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 214, { rx: 3 }),
  head(kit, { x: 150, y: 122, r: 82, yaw: 32, pitch: 12, layers: ['ball', 'cross', 'plane'], width: 2.2 }),
  kit.text(246, 110, 'side plane', { size: 13 }),
  kit.text(246, 128, 'an ellipse', { size: 12 }),
);
