// Set the values: paper for the lights, one middle tone, one dark.
import { at, scene, tonal } from './shared.mjs';

const build = (kit) => kit.svg({ width: 360, height: 190 },
  kit.rect(20, 14, 320, 164, { rx: 3 }),
  at(30, 0, 1, scene(kit, 'values', { uid: 'v' })),
  [['paper', 'd-lit'], ['middle', 'd-fill-soft'], ['dark', 'd-fill']].map(([label, cls], i) => [
    `<rect x="${36 + i * 70}" y="30" width="13" height="13" class="${cls}" stroke="#808080" stroke-width="1"/>`,
    kit.text(54 + i * 70, 41, label, { size: 12 }),
  ]),
  kit.text(180, 168, 'lights stay paper', { anchor: 'middle', size: 12 }),
);

export default (kit) => tonal(build(kit));
