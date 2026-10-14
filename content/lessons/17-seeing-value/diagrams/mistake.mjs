// The usual mistake: filling a shape by what the object is. A white mug is filled white all over, and
// its shadow side disappears. Right: fill what you see while squinting.
import { panel, toneMug, at } from './tones.js';

export default (kit) => {
  const s = 0.5;
  return kit.svg({ width: 560, height: 290 },
    panel(16, 16, 256, 224), at(16 - 90 * s + 30, 20, s, toneMug(kit, { id: 'm1', mode: 'white' }).svg),
    panel(288, 16, 256, 224), at(288 - 90 * s + 30, 20, s, toneMug(kit, { id: 'm2', mode: 'flat' }).svg),
    kit.tag(144, 266, 'Filled by what it is', { tone: 'bad' }), kit.tag(416, 266, 'Filled by what you see', { tone: 'mark' }),
  );
};
