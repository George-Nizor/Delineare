// Step two: choose a turn. A plan view from above: the object's footprint at 45 degrees to the
// picture plane, then turned 15 degrees more so one side makes 60 degrees with it.
import { rad } from './turn.js';

export default (kit) => {
  const foot = (x, y, deg, cls, width) => {
    const t = rad(deg);
    const w = 130;
    const d = 96;
    const p0 = [x, y];
    const p1 = [x + Math.cos(t) * w, y - Math.sin(t) * w];
    const p3 = [x - Math.sin(t) * d, y - Math.cos(t) * d];
    const p2 = [p1[0] + p3[0] - x, p1[1] + p3[1] - y];
    return kit.path(`M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} Z`, { cls, width });
  };
  const x = 250;
  const y = 232;
  const arc = (deg, r, cls = 'd-mark') => {
    const t = rad(deg);
    return kit.path(`M ${x + r} ${y} A ${r} ${r} 0 0 0 ${x + r * Math.cos(t)} ${y - r * Math.sin(t)}`, { cls, width: 1.6 });
  };
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 10, 508, 320, { rx: 4 }),
    kit.line(60, y, 500, y, { cls: 'd-guide', width: 1.4, dash: '6 6' }), kit.text(500, y + 18, 'picture plane', { anchor: 'end', size: 12 }),
    foot(x, y, 45, 'd-guide', 2.2), foot(x, y, 60, 'd-ink', 2.6),
    arc(45, 60), arc(60, 100),
    kit.text(x + 30, y - 14, '45', { size: 13 }), kit.text(x + 70, y - 42, '60', { size: 13 }),
    kit.text(40, 58, 'seen from above', { size: 13 }),
    kit.text(40, 78, 'grey: first drawing', { size: 12 }), kit.text(40, 96, 'black: turned 15 degrees', { size: 12 }),
    kit.dot(x, y, { r: 4 }), kit.text(x, y + 22, 'nearest corner stays put', { anchor: 'middle', size: 12 }),
  );
};
