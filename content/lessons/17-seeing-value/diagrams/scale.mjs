// Step one: a strip of five boxes from white to the darkest tone, each one a step darker than the
// last. The strip sits on a neutral grey so the steps can be judged against it.
import { panel, chips } from './tones.js';

export default (kit) => kit.svg({ width: 540, height: 280 },
  panel(16, 8, 508, 200),
  chips(60, 40, 80, 136),
  kit.text(100, 232, 'paper', { anchor: 'middle', size: 13 }),
  kit.text(420, 232, 'your darkest tone', { anchor: 'middle', size: 13 }),
  kit.text(270, 262, 'each box a little darker than the one before', { anchor: 'middle', size: 13 }),
);
