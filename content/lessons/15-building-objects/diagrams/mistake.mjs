// The usual mistake: trimming the construction away to make the drawing neat. Left, only the outline
// is kept. Right, the construction stays, drawn through.
import { mug, parts } from './mug.js';

export default (kit) => {
  const m = mug();
  const sc = 0.62;
  const place = (x, art) => `<g transform="translate(${x - 30} 45) scale(${sc})">${art.flat(Infinity).join('')}</g>`;
  const clean = parts(kit, m, { through: false, width: 3.4 });
  const full = parts(kit, m, { through: true, width: 3.4 });
  return kit.svg({ width: 560, height: 290 },
    kit.rect(16, 16, 256, 258, { rx: 3 }), kit.tag(144, 44, 'Construction trimmed', { tone: 'bad' }), place(16, [clean.body, clean.handle]),
    kit.rect(288, 16, 256, 258, { rx: 3 }), kit.tag(416, 44, 'Construction left in', { tone: 'mark' }), place(288, [full.axis, full.body, full.handle, full.joins]),
  );
};
