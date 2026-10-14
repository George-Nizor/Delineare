// A finished sphere under one lamp: a clear split between light and shadow, halftones that pass
// gradually into the dark, a cast shadow that falls away from the lamp, and the darkest tone where the
// sphere meets the table.
import { sphere, paintSoft, panel } from './shade.js';

export default (kit) => {
  const s = sphere({ cx: 190, cy: 150, R: 100 });
  return kit.svg({ width: 540, height: 340 }, panel(16, 8, 508, 324), paintSoft(s, 'ex'));
};
