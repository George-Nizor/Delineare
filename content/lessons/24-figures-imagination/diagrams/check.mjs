// Check: count the heads, and see that the weight falls over the supporting foot.
import { keyPoints, mannequin, POSES, projector } from './shared.mjs';

export default (kit) => {
  const o = { x: 170, floor: 220, s: 22 };
  const k = keyPoints(POSES.reach, 0, o);
  const P = projector(0, o);
  const y0 = P([0, 7.5, 0])[1];
  const y1 = P([0, 0, 0])[1];
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 14, 320, 214, { rx: 3 }),
    mannequin(kit, POSES.reach, 0, { ...o, tone: 'guide', width: 1.4 }),
    kit.line(k.pel[0], k.pel[1], k.pel[0], y1 + 4, { cls: 'd-mark', width: 2, dash: '6 4' }),
    kit.circle(k.pel[0], k.pel[1], 4, { cls: 'd-mark', width: 2 }),
    kit.text(k.pel[0] + 40, 170, 'weight falls between', { size: 11 }), kit.text(k.pel[0] + 40, 184, 'the feet', { size: 11 }),
    kit.line(60, y0, 60, y1, { cls: 'd-mark', width: 2 }), kit.line(54, y0, 66, y0, { cls: 'd-mark', width: 2 }), kit.line(54, y1, 66, y1, { cls: 'd-mark', width: 2 }),
    kit.text(70, (y0 + y1) / 2, '7.5 heads', { size: 12 }),
  );
};
