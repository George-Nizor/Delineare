// A finished frame: a horizon with a vanishing point at each end and five plotted boxes of different
// sizes, one above the horizon, some across it and some below. Every edge was ruled.
import { plotted, drawPlotted, frame } from './geom.js';

export default (kit) => {
  const L = [48, 100];
  const R = [492, 100];
  const boxes = [
    { v: 118, y1: 168, y2: 250, xa: 74, xb: 172 },
    { v: 262, y1: 70, y2: 156, xa: 196, xb: 330 },
    { v: 424, y1: 30, y2: 84, xa: 372, xb: 462 },
    { v: 372, y1: 214, y2: 288, xa: 304, xb: 448 },
    { v: 168, y1: 36, y2: 76, xa: 118, xb: 214 },
  ];
  return kit.svg({ width: 540, height: 330 }, frame(kit, { label: false }),
    boxes.map((b) => drawPlotted(kit, plotted(L, R, b), { width: 1.9 })));
};
