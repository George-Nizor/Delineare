// A finished still life: a box, a cup and a ball in paper, one middle tone and one dark.
import { at, scene, tonal } from './shared.mjs';

const build = (kit) => kit.svg({ width: 540, height: 350 },
  kit.rect(20, 20, 500, 310, { rx: 4 }),
  at(34, 6, 1.62, scene(kit, 'values', { uid: 'ex' })),
);

export default (kit) => tonal(build(kit));
