// A finished page: a graded strip, four tone squares, and a ball shaded with curved hatching.
import { gradedStrip, hatchBox, hatchedBall, tonal } from './shared.mjs';

const build = (kit) => {
  const angles = [58, 118, 28, 88];
  return kit.svg({ width: 540, height: 350 },
    kit.rect(20, 20, 500, 310, { rx: 4 }),
    gradedStrip(kit, 50, 46, 440, 46),
    [0, 1, 2, 3].map((i) => [
      angles.slice(0, i + 1).map((angle, k) => hatchBox(kit, 50 + i * 62, 130, 50, 50, { angle, gap: 6.5 - k * 0.4, seed: 30 + i * 4 + k, width: 1.15, wobble: 0.15 })),
      kit.rect(50 + i * 62, 130, 50, 50, { cls: 'd-frame', stroke: 1.2 }),
    ]),
    kit.text(50, 204, 'one to four layers', { size: 12 }),
    hatchedBall(kit, 392, 226, 68),
  );
};

export default (kit) => tonal(build(kit));
