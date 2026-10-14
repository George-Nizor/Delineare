// A finished page: one invented pose drawn from the front, three-quarter and side, with
// shoulders, hips and knees carried across.
import { keyPoints, mannequin, POSES } from './shared.mjs';

export default (kit) => {
  const s = 31;
  const floor = 322;
  const xs = [120, 270, 420];
  const k = keyPoints(POSES.reach, 0, { x: xs[0], floor, s });
  const rows = [(k.shoulders[0][1] + k.shoulders[1][1]) / 2, (k.hips[0][1] + k.hips[1][1]) / 2, k.knees[0][1]];
  return kit.svg({ width: 540, height: 350 },
    kit.rect(20, 20, 500, 310, { rx: 4 }),
    rows.map((y) => kit.line(40, y, 500, y, { cls: 'd-mark', width: 1.1, dash: '5 4' })),
    [0, 45, 90].map((yaw, i) => mannequin(kit, POSES.reach, yaw, { x: xs[i], floor, s, width: 1.8 })),
  );
};
