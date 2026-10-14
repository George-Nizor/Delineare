// Cross: a second layer across the first at a sharp angle, then a third where it should be darker.
import { hatchBox, tonal } from './shared.mjs';

const build = (kit) => {
  const layers = [[55, 8], [125, 8], [90, 8]];
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 20, 320, 200, { rx: 3 }),
    [['one layer', 36], ['second layer', 135], ['third layer', 234]].map(([label, x], i) => [
      layers.slice(0, i + 1).map(([angle, gap], k) => hatchBox(kit, x, 52, 90, 96, { angle, gap, seed: 11 + i * 3 + k, width: 1.25 })),
      kit.rect(x, 52, 90, 96, { cls: 'd-frame', stroke: 1.2 }),
      kit.text(x + 45, 174, label, { anchor: 'middle', size: 13 }),
    ]),
    kit.text(180, 202, 'each layer crosses the last at a sharp angle', { anchor: 'middle', size: 12 }),
  );
};

export default (kit) => tonal(build(kit));
