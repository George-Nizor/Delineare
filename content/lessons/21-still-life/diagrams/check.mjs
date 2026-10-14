// Check: flip the drawing in a mirror and the largest error shows. Here the cup is too short.
import { at, mirrored, scene } from './shared.mjs';

export default (kit) => kit.svg({ width: 560, height: 220 },
  kit.rect(16, 16, 256, 188, { rx: 3 }),
  kit.tag(144, 44, 'Your drawing', { tone: 'mark' }),
  at(28, 35, 0.82, scene(kit, 'lines', { uid: 'c1', cupHeight: 52 })),
  kit.rect(288, 16, 256, 188, { rx: 3 }),
  kit.tag(416, 44, 'Flipped in a mirror'),
  mirrored(528, 35, 0.82, scene(kit, 'lines', { uid: 'c2', cupHeight: 52 })),
  kit.line(296, 35 + 80 * 0.82, 536, 35 + 80 * 0.82, { cls: 'd-mark', width: 1.4, dash: '5 4' }),
  kit.text(416, 190, 'the cup should rise above the box', { anchor: 'middle', size: 12 }),
);
