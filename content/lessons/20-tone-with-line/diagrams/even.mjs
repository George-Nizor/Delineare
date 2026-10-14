// Even it out: a patch with one dark line and pale gaps, then the same patch with the gaps filled.
import { hatchBox, tonal } from './shared.mjs';

const build = (kit) => {
  const uneven = [
    hatchBox(kit, 40, 48, 120, 110, { angle: 55, gap: 9, seed: 4, width: 1.2 }),
    hatchBox(kit, 40, 48, 120, 110, { angle: 122, gap: 14, seed: 8, width: 1.2 }),
    kit.line(52, 150, 150, 56, { width: 3.6 }),
  ];
  const even = [
    hatchBox(kit, 200, 48, 120, 110, { angle: 55, gap: 9, seed: 4, width: 1.2 }),
    hatchBox(kit, 200, 48, 120, 110, { angle: 122, gap: 9, seed: 8, width: 1.2 }),
    hatchBox(kit, 200, 48, 120, 110, { angle: 90, gap: 9, seed: 9, width: 1 }),
  ];
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 20, 320, 200, { rx: 3 }),
    uneven, kit.rect(40, 48, 120, 110, { cls: 'd-frame', stroke: 1.2 }),
    kit.circle(101, 103, 24, { cls: 'd-mark', width: 1.8, dash: '4 4' }),
    kit.text(100, 182, 'one line stands out', { anchor: 'middle', size: 13 }),
    even, kit.rect(200, 48, 120, 110, { cls: 'd-frame', stroke: 1.2 }),
    kit.text(260, 182, 'gaps filled', { anchor: 'middle', size: 13 }),
  );
};

export default (kit) => tonal(build(kit));
