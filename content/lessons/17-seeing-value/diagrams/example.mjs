// A finished page: the five-box value scale along the top and, below it, a mug drawn as three flat
// shapes: paper for the lit side, one even mid tone and one even dark.
import { panel, toneMug, at, chips } from './tones.js';

export default (kit) => kit.svg({ width: 540, height: 340 }, panel(16, 8, 508, 324),
  chips(36, 22, 56, 34),
  at(138, 60, 0.72, toneMug(kit, { id: 'ex', mode: 'flat', cx: 110 }).svg));
