// Step five: compare. Each tone on the drawing is matched against the strip of five.
import { panel, toneMug, at, chips, TONE } from './tones.js';

export default (kit) => {
  const t = toneMug(kit, { id: 'cp', mode: 'flat' });
  const [x0, , x1] = t.bbox;
  const target = (xx) => 60 + xx;
  const link = (fromX, fromY, chip) => kit.line(target(fromX), 20 + fromY, 74 + chip * 54, 296, { cls: 'd-mark', width: 1.6, dash: '4 4' });
  const w = x1 - x0;
  return kit.svg({ width: 540, height: 340 }, panel(16, 8, 508, 324),
    at(60, 8, 0.78, t.svg),
    chips(46, 290, 54, 34),
    link(x0 + w * 0.17, 190, 0), link(x0 + w * 0.5, 190, 2), link(x0 + w * 0.82, 190, 4),
  );
};
