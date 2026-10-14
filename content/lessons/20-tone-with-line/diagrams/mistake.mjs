// The usual mistake: slow, careful strokes leave a dot of ink at each end and the tone looks spotty.
// Fast strokes stay clean at the ends and the tone is even.
import { hatchBox, tonal } from './shared.mjs';

const build = (kit) => kit.svg({ width: 560, height: 220 },
  kit.rect(16, 16, 256, 188, { rx: 3 }),
  kit.tag(144, 44, 'Slow and careful', { tone: 'bad' }),
  hatchBox(kit, 40, 64, 208, 118, { angle: 72, gap: 10, seed: 6, width: 1.2, wobble: 0.1, dots: 2.1 }),
  kit.rect(288, 16, 256, 188, { rx: 3 }),
  kit.tag(416, 44, 'Fast and clean'),
  hatchBox(kit, 312, 64, 208, 118, { angle: 72, gap: 10, seed: 6, width: 1.2, wobble: 0.1 }),
);

export default (kit) => tonal(build(kit));
