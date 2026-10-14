// Step four: fill each shape with one even tone: paper for the lightest, one mid tone, one dark.
import { panel, toneMug, at } from './tones.js';

export default (kit) => kit.svg({ width: 540, height: 340 }, panel(16, 8, 508, 324), at(86, 14, 0.9, toneMug(kit, { id: 'fl', mode: 'flat' }).svg));
