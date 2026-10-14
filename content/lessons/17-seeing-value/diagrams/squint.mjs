// Step two: squint. Left, the mug as the eye sees it, with soft gradations and detail. Right, what is
// left when you squint: a few flat shapes.
import { panel, toneMug, at } from './tones.js';

export default (kit) => {
  const s = 0.5;
  return kit.svg({ width: 560, height: 290 },
    panel(16, 16, 256, 224), at(16 - 90 * s + 30, 20, s, toneMug(kit, { id: 'sq1', mode: 'smooth' }).svg),
    panel(288, 16, 256, 224), at(288 - 90 * s + 30, 20, s, toneMug(kit, { id: 'sq2', mode: 'flat' }).svg),
    kit.text(144, 266, 'what you see', { anchor: 'middle', size: 13 }), kit.text(416, 266, 'squinting', { anchor: 'middle', size: 13 }),
  );
};
