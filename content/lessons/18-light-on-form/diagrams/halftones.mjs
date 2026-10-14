// Step five: the halftones, the lit tones between the shadow and the part of the form that faces the
// lamp. The largest area is the lightest one, and the darkest halftone sits close to the terminator.
import { sphere, paint, panel } from './shade.js';

export default (kit) => {
  const s = sphere({ cx: 190, cy: 150, R: 100 });
  return kit.svg({ width: 540, height: 340 }, panel(16, 8, 508, 324), paint(s, 'halftones', 'ht'));
};
