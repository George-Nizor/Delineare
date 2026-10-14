// Step three: draw only the borders between the shapes you see: the lit side, the middle, the shadow
// side, the dark opening, the handle and the shadow on the table.
import { toneMug, at } from './tones.js';

export default (kit) => kit.svg({ width: 540, height: 340 }, kit.rect(16, 8, 508, 324, { rx: 4 }),
  at(86, 14, 0.9, toneMug(kit, { id: 'bd', mode: 'outline' }).svg));
