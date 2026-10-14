// Step four: refine the shadow. The core shadow is darkest along the terminator, and the reflected
// light nearer the edge stays lighter, though still darker than any halftone.
import { sphere, paint, panel } from './shade.js';

export default (kit) => {
  const s = sphere({ cx: 190, cy: 150, R: 100 });
  return kit.svg({ width: 540, height: 380 }, panel(16, 8, 508, 324), paint(s, 'core', 'co'),
    kit.text(270, 354, 'core shadow: the darkest band along the terminator', { anchor: 'middle', size: 13 }),
    kit.text(270, 372, 'reflected light: the lighter shadow nearer the edge', { anchor: 'middle', size: 13 }));
};
