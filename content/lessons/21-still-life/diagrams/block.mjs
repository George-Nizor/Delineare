// Block in: the envelope around the whole group, then straight-sided blocks for each object, with
// a vertical line to measure against.
import { at, scene } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 190 },
  kit.rect(20, 14, 320, 164, { rx: 3 }),
  at(30, 0, 1, scene(kit, 'block', { uid: 'b' })),
  kit.line(30 + 126 - 27, 42, 30 + 126 - 27, 158, { cls: 'd-guide', width: 1.2, dash: '5 5' }),
  kit.text(30 + 126 - 22, 52, 'vertical to measure from', { size: 11 }),
  kit.text(180, 168, 'envelope first, then a block for each object', { anchor: 'middle', size: 12 }),
);
