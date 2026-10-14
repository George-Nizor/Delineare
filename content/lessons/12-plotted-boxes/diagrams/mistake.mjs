// The usual mistake: forcing the back vertical to stand straight, so it misses the corners the
// ruled lines made. Right: join the corners and accept the small lean.
import { plotted } from './geom.js';

export default (kit) => {
  const make = (dx, fix) => {
    const L = [30 + dx, 96];
    const R = [258 + dx, 96];
    const p = plotted(L, R, { v: 150 + dx, y1: 130, y2: 226, xa: 84 + dx, xb: 212 + dx });
    const P = p.P;
    // A ruler placed a little off: the top-back corner lands 9 units to the right of where the
    // other ruled lines put it.
    P.Tb = [P.Tb[0] + 9, P.Tb[1]];
    const line = (a, b, o = {}) => kit.line(a[0], a[1], b[0], b[1], { width: 2.2, ...o });
    const parts = [
      line(P.Tf, P.Bf), line(P.Tl, P.Bl), line(P.Tr, P.Br), line(P.Tf, P.Tl), line(P.Tf, P.Tr),
      line(P.Tl, P.Tb), line(P.Tr, P.Tb), line(P.Bf, P.Bl), line(P.Bf, P.Br),
      line(P.Bl, P.Bb, { cls: 'd-guide', dash: '4 5', width: 1.6 }), line(P.Br, P.Bb, { cls: 'd-guide', dash: '4 5', width: 1.6 }),
      kit.dot(P.Tb[0], P.Tb[1], { r: 3.6 }), kit.dot(P.Bb[0], P.Bb[1], { r: 3.6 }),
    ];
    if (fix) parts.push(line([P.Bb[0], P.Tb[1]], P.Bb, { cls: 'd-bad', width: 2.6 }), kit.text(P.Tb[0], P.Tb[1] - 22, 'misses the corner', { anchor: 'middle', size: 12 }));
    else parts.push(line(P.Tb, P.Bb, { cls: 'd-mark', width: 2.6 }));
    return parts;
  };
  return kit.svg({ width: 560, height: 280 },
    kit.rect(16, 16, 256, 250, { rx: 3 }), kit.tag(144, 44, 'Redrawn straight', { tone: 'bad' }), make(0, true), kit.text(144, 254, 'straight but off the corners', { anchor: 'middle', size: 12 }),
    kit.rect(288, 16, 256, 250, { rx: 3 }), kit.tag(416, 44, 'Joined and left', { tone: 'mark' }), make(272, false), kit.text(416, 254, 'leans a little', { anchor: 'middle', size: 12 }),
  );
};
