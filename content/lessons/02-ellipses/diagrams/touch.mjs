// Make it touch: each ellipse sits snugly against the box and the ellipse beside it.
import { row } from './shared.mjs';

export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 20, 320, 200, { rx: 3 }),
  kit.rect(44, 86, 272, 70, { cls: 'd-frame', stroke: 1.6 }),
  row(kit, 44, 86, 272, 70, { ratio: 0.55, seed: 21 }),
  kit.text(180, 196, 'touching the edges and each other', { anchor: 'middle', size: 13 }),
);
