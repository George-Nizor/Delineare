// A finished page: six Loomis heads, two from the front, two three-quarter and two in profile.
import { head } from './shared.mjs';

export default (kit) => {
  const views = [[0, 0], [0, -14], [35, 6], [42, -8], [90, 0], [90, 12]];
  return kit.svg({ width: 540, height: 350 },
    kit.rect(20, 20, 500, 310, { rx: 4 }),
    views.map(([yaw, pitch], i) => head(kit, { x: 100 + (i % 3) * 170, y: 104 + Math.floor(i / 3) * 140, r: 52, yaw, pitch, width: 1.8 })),
  );
};
