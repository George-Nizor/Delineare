// The usual mistake: a head drawn at whatever size felt right, with the body squeezed into the
// space left. The right way marks all 7.5 divisions first.
import { AVERAGE, SQUEEZED, figure } from './shared.mjs';

export default (kit) => {
  const top = 26;
  const unit = 25;
  const out = [kit.rect(16, 12, 256, 216, { rx: 3 }), kit.tag(144, 30, 'Head first, legs squeezed', { tone: 'bad' }), kit.rect(288, 12, 256, 216, { rx: 3 }), kit.tag(416, 30, 'Grid first')];
  out.push(figure(kit, 144, top + 6, unit, { table: SQUEEZED, hu: 1 }));
  for (let i = 0; i <= 7; i += 1) out.push(kit.line(336, top + 6 + i * unit, 496, top + 6 + i * unit, { cls: 'd-guide', width: 1, dash: '4 5' }));
  out.push(kit.line(336, top + 6 + 7.5 * unit, 496, top + 6 + 7.5 * unit, { cls: 'd-guide', width: 1, dash: '4 5' }));
  out.push(figure(kit, 416, top + 6, unit, { table: AVERAGE }));
  return kit.svg({ width: 560, height: 240 }, out);
};
