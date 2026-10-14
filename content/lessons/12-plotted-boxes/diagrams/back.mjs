// Lines from the new verticals back to the far vanishing points cross at the back corners. The
// last vertical joins those two corners.
import { frame, L0, R0, plotted, drawPlotted } from './geom.js';

export default (kit) => {
  const p = plotted(L0, R0, { v: 270, y1: 192, y2: 292, xa: 170, xb: 390 });
  const { Tl, Tr, Bl, Br, Tb, Bb } = p.P;
  return kit.svg({ width: 540, height: 330 }, frame(kit),
    kit.line(Tl[0], Tl[1], Tb[0], Tb[1], { cls: 'd-guide', width: 1.4 }),
    drawPlotted(kit, p, { width: 2.2, only: (e) => e.name !== 'Tb-Bb' }),
    kit.line(Tb[0], Tb[1], Bb[0], Bb[1], { cls: 'd-mark', width: 2.6 }),
    kit.dot(Tb[0], Tb[1], { r: 4.2, cls: 'd-mark-fill' }), kit.dot(Bb[0], Bb[1], { r: 4.2, cls: 'd-mark-fill' }),
    kit.text(Tb[0], Tb[1] - 16, 'back vertical joins the two crossing points', { anchor: 'middle', size: 12 }),
  );
};
