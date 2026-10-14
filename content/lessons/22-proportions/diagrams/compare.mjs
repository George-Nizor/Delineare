// Compare: hold a pencil at arm's length, mark the head with your thumb, then step that length
// down the figure and count.
import { figure } from './shared.mjs';

export default (kit) => {
  const top = 24;
  const unit = 24;
  const x = 190;
  const out = [kit.rect(20, 14, 320, 214, { rx: 3 }), figure(kit, x, top, unit, { cls: 'd-guide', width: 1.5 })];
  // Pencil with a thumb mark at one head.
  out.push(kit.line(56, top - 2, 56, top + 5 * unit, { width: 4 }), kit.line(56, top + 5 * unit, 56, top + 5 * unit + 8, { width: 4, cls: 'd-guide' }));
  out.push(kit.line(44, top + unit, 68, top + unit, { cls: 'd-mark', width: 2.4 }), kit.text(36, top + 5 * unit + 28, 'thumb at the chin', { size: 11 }), kit.text(36, top + 5 * unit + 43, 'marks one head', { size: 11 }));
  // Steps down the figure.
  for (let i = 0; i < 7; i += 1) {
    out.push(kit.line(x + 78, top + i * unit + 2, x + 78, top + (i + 1) * unit - 2, { cls: 'd-mark', width: 2 }), kit.text(x + 88, top + (i + 0.5) * unit + 4, String(i + 1), { size: 12 }));
  }
  out.push(kit.line(x + 78, top + 7 * unit + 2, x + 78, top + 7.5 * unit, { cls: 'd-mark', width: 2 }), kit.text(x + 88, top + 7.25 * unit + 4, 'and a half', { size: 11 }));
  return kit.svg({ width: 360, height: 240 }, out);
};
