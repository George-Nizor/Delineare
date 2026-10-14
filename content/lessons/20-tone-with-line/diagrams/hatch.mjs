// Hatch: the same lines, spaced wide, closer and closest. Closer lines make a darker tone.
import { hatchBox, tonal } from './shared.mjs';

const build = (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 20, 320, 200, { rx: 3 }),
  [[36, 14, 'wide apart', 1], [135, 8, 'closer', 2], [234, 4.2, 'closest', 3]].map(([x, gap, label, seed]) => [
    hatchBox(kit, x, 52, 90, 96, { angle: 55, gap, seed, width: 1.3 }),
    kit.rect(x, 52, 90, 96, { cls: 'd-frame', stroke: 1.2 }),
    kit.text(x + 45, 174, label, { anchor: 'middle', size: 13 }),
  ]),
  kit.text(180, 202, 'same lines, same speed, less space between them', { anchor: 'middle', size: 12 }),
);

export default (kit) => tonal(build(kit));
