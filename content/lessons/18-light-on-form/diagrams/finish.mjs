// Step six: deepen the occlusion shadow, the darkest tone, where the form meets the table.
import { sphere, paint, panel } from './shade.js';

export default (kit) => {
  const s = sphere({ cx: 190, cy: 150, R: 100 });
  return kit.svg({ width: 540, height: 360 }, panel(16, 8, 508, 324), paint(s, 'full', 'fi'),
    kit.text(270, 352, 'darkest of all where the form meets the table', { anchor: 'middle', size: 13 }));
};
