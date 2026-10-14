// Map the shadows: the shape of each shadow and cast shadow, filled with one flat dark.
import { at, scene, tonal } from './shared.mjs';

const build = (kit) => kit.svg({ width: 360, height: 190 },
  kit.rect(20, 14, 320, 164, { rx: 3 }),
  at(30, 0, 1, scene(kit, 'shadows', { uid: 's' })),
  kit.arcArrow(34, 42, 56, 62, { lift: 8 }),
  kit.text(30, 36, 'light', { anchor: 'start', size: 13 }),
  kit.text(180, 168, 'one flat dark, no halftones yet', { anchor: 'middle', size: 12 }),
);

export default (kit) => tonal(build(kit));
