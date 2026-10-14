// Step three: map the shadows. The form shadow and the cast shadow get one even dark tone, dark
// enough to contrast with the light but not black. The lit side stays bare.
import { sphere, paint, panel } from './shade.js';

export default (kit) => {
  const s = sphere({ cx: 190, cy: 150, R: 100 });
  return kit.svg({ width: 540, height: 340 }, panel(16, 8, 508, 324), paint(s, 'shadows', 'sh'));
};
