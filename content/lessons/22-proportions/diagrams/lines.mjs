// Mark the body lines: counting down from the chin, nipples at 1 head, navel at 2, crotch at 3,
// and the knees 5.5 heads from the top.
import { figure, marks } from './shared.mjs';

export default (kit) => {
  const top = 22;
  const unit = 27;
  const x = 120;
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 14, 320, 214, { rx: 3 }),
    figure(kit, x, top, unit, { cls: 'd-guide', width: 1.5 }),
    marks(kit, x, top, unit, [[1, 'chin'], [2, 'nipples, 1 down'], [3, 'navel, 2 down'], [4, 'crotch, 3 down'], [5.5, 'knees, 5.5 from top']], { left: 50, right: 190 }),
  );
};
