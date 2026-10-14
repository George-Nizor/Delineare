// The usual mistake: one object finished before the others are placed, so the last one has no room.
// The right way is all three blocked in together, then checked.
import { at, scene, tonal } from './shared.mjs';

const build = (kit) => kit.svg({ width: 560, height: 220 },
  kit.rect(16, 16, 256, 188, { rx: 3 }),
  kit.tag(144, 44, 'One at a time', { tone: 'bad' }),
  `<svg x="16" y="16" width="256" height="188" viewBox="16 16 256 188" overflow="hidden">${at(52, 40, 0.9, scene(kit, 'values', { uid: 'm1', only: ['box'] }))}</svg>`,
  kit.rect(288, 16, 256, 188, { rx: 3 }),
  kit.tag(416, 44, 'All together'),
  at(300, 40, 0.8, scene(kit, 'block', { uid: 'm2' })),
);

export default (kit) => tonal(build(kit));
