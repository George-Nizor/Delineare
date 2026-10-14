// Divide the height: a vertical line cut into 7.5 equal heads, with one head bracketed at the top.
export default (kit) => {
  const top = 26;
  const unit = 24;
  const x = 150;
  const out = [kit.rect(20, 14, 320, 214, { rx: 3 }), kit.line(x, top, x, top + 7.5 * unit, { width: 2 })];
  for (let i = 0; i <= 7; i += 1) {
    out.push(kit.line(x - 14, top + i * unit, x + 14, top + i * unit, { width: 1.8 }));
    if (i < 7) out.push(kit.text(x - 28, top + (i + 0.5) * unit + 4, String(i + 1), { anchor: 'end', size: 12 }));
  }
  out.push(kit.line(x - 14, top + 7.5 * unit, x + 14, top + 7.5 * unit, { width: 1.8 }));
  out.push(kit.text(x - 28, top + 7.25 * unit + 4, 'half', { anchor: 'end', size: 11 }));
  out.push(kit.line(x + 40, top, x + 40, top + unit, { cls: 'd-mark', width: 2 }));
  out.push(kit.line(x + 34, top, x + 46, top, { cls: 'd-mark', width: 2 }), kit.line(x + 34, top + unit, x + 46, top + unit, { cls: 'd-mark', width: 2 }));
  out.push(kit.text(x + 54, top + unit / 2 + 4, 'one head', { size: 13 }));
  out.push(kit.text(x + 54, top + 7.5 * unit - 6, '7.5 heads in all', { size: 13 }));
  return kit.svg({ width: 360, height: 240 }, out);
};
