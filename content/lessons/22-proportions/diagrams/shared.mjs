// A standing mannequin drawn from the lesson's numbers. Not a diagram itself.
//
// Heights are in head units counted down from the top of the head, as Proko gives them from
// Richer's average man: chin at 1, nipples at 2, navel at 3, crotch at 4, knees at 5.5, floor at 7.5.
// Widths follow the same unit: shoulders including the deltoids are two heads across.

export const AVERAGE = { chin: 1, nipples: 2, navel: 3, crotch: 4, knee: 5.5, ankle: 7.1, floor: 7.5 };
// A figure drawn badly: a head chosen too large, then the rest squeezed into what is left.
export const SQUEEZED = { chin: 2.1, nipples: 2.9, navel: 3.5, crotch: 3.9, knee: 5.2, ankle: 6.95, floor: 7.5 };

// A tapered limb segment with round ends, as an outline.
export function capsule(kit, [x1, y1], [x2, y2], r1, r2, opts = {}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const p = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  const d = `M ${p(x1 + nx * r1, y1 + ny * r1)} L ${p(x2 + nx * r2, y2 + ny * r2)} A ${r2} ${r2} 0 0 0 ${p(x2 - nx * r2, y2 - ny * r2)} L ${p(x1 - nx * r1, y1 - ny * r1)} A ${r1} ${r1} 0 0 0 ${p(x1 + nx * r1, y1 + ny * r1)} Z`;
  return kit.path(d, { width: 1.8, ...opts });
}

// The figure. `x` is the centre line, `top` the top of the head, `unit` the pixels in one head.
// `parts` picks what to draw: 'masses', 'limbs'. `hu` is the head width scale (1 = normal).
export function figure(kit, x, top, unit, { table = AVERAGE, hu = 1, parts = ['masses', 'limbs'], cls = 'd-ink', width = 1.8 } = {}) {
  const Y = (h) => top + h * unit;
  const t = table;
  const out = [];
  const o = { cls, width };
  const headH = t.chin * unit;
  const head = (headH / unit) * 0; // placeholder so the head height reads from the table
  void head;
  if (parts.includes('masses')) {
    // Head.
    out.push(kit.ellipse(x, top + headH / 2, 0.36 * unit * (headH / unit), headH / 2, o));
    // Ribcage and pelvis.
    const ribTop = Y(t.chin + 0.18);
    const ribBottom = Y(t.navel + 0.1);
    out.push(kit.ellipse(x, (ribTop + ribBottom) / 2, 0.8 * unit, (ribBottom - ribTop) / 2, o));
    const pelTop = Y(t.navel + 0.25);
    const pelBottom = Y(t.crotch + 0.12);
    out.push(kit.ellipse(x, (pelTop + pelBottom) / 2, 0.78 * unit, (pelBottom - pelTop) / 2, o));
    // Shoulder line.
    out.push(kit.smooth([[x - 0.98 * unit, Y(t.chin + 0.42)], [x - 0.5 * unit, Y(t.chin + 0.2)], [x - 0.14 * unit, Y(t.chin)]], { cls, width: 1.4 }), kit.smooth([[x + 0.98 * unit, Y(t.chin + 0.42)], [x + 0.5 * unit, Y(t.chin + 0.2)], [x + 0.14 * unit, Y(t.chin)]], { cls, width: 1.4 }));
    // Neck and spine.
    out.push(kit.line(x, Y(t.chin), x, Y(t.chin + 0.28), o));
    out.push(kit.line(x, Y(t.chin + 0.3), x, Y(t.navel + 0.3), { cls: 'd-guide', width: 1.4 }));
  }
  if (parts.includes('limbs')) {
    const sh = Y(t.chin + 0.42);
    const hip = Y(t.crotch - 0.3);
    for (const s of [-1, 1]) {
      // Arm: shoulder, elbow at the navel, wrist just below the crotch.
      out.push(capsule(kit, [x + s * 0.95 * unit, sh], [x + s * 1.1 * unit, Y(t.navel)], 0.22 * unit, 0.19 * unit, o));
      out.push(capsule(kit, [x + s * 1.1 * unit, Y(t.navel)], [x + s * 1.22 * unit, Y(t.crotch + 0.2)], 0.19 * unit, 0.13 * unit, o));
      // Leg: hip, knee, ankle.
      out.push(capsule(kit, [x + s * 0.34 * unit, hip], [x + s * 0.4 * unit, Y(t.knee)], 0.3 * unit, 0.2 * unit, o));
      out.push(capsule(kit, [x + s * 0.4 * unit, Y(t.knee)], [x + s * 0.36 * unit, Y(t.ankle)], 0.2 * unit, 0.12 * unit, o));
      out.push(kit.polyline([[x + s * 0.3 * unit, Y(t.ankle) + 2], [x + s * 0.3 * unit, Y(t.floor) - 1], [x + s * 0.72 * unit, Y(t.floor) - 1]], o));
    }
  }
  return out;
}

// Horizontal marks at a list of heights, each with a short label on the right.
export function marks(kit, x, top, unit, items, { left, right, cls = 'd-mark' } = {}) {
  return items.map(([h, label]) => [
    kit.line(left, top + h * unit, right, top + h * unit, { cls, width: 1.2, dash: '5 4' }),
    label ? kit.text(right + 6, top + h * unit + 4, label, { size: 12 }) : '',
  ]);
}
