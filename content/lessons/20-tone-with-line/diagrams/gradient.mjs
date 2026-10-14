// Make a gradient: a strip as long as your hand, white at one end and black at the other, with
// more layers and closer lines toward the dark end.
import { gradedStrip, tonal } from './shared.mjs';

const build = (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 20, 320, 200, { rx: 3 }),
  gradedStrip(kit, 40, 92, 280, 52),
  kit.text(40, 80, 'paper', { size: 13 }),
  kit.text(320, 80, 'darkest', { anchor: 'end', size: 13 }),
  kit.arcArrow(60, 168, 300, 168, { lift: 10 }),
  kit.text(180, 202, 'more layers, closer lines', { anchor: 'middle', size: 12 }),
);

export default (kit) => tonal(build(kit));
