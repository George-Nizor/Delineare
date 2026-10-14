// Whole scenes for lesson 19's diagrams (not a diagram itself): a box with its sun shadow, and a box
// with its lamp shadow, built so the example and the wrong-and-right pair reuse them.
import { cam, standing, sunShadow, lampShadow, poly } from './cast.js';
import { drawBox } from '../../12-plotted-boxes/diagrams/geom.js';

export function sunScene(kit, { f = 300, cy = 64, box = { x: -1.9, z: 4.6 }, hs = [1.6] } = {}) {
  const c = cam({ f, cy });
  const out = [kit.line(22, c.horizonY, 518, c.horizonY, { cls: 'd-mark', width: 1.2, dash: '5 5' })];
  const vp = c.vp([0, 0, 1]);
  const items = [].concat(box).map((b, i) => ({ ...b, h: b.h ?? hs[i] ?? 1.6 }));
  const built = items.map((b) => { const s = standing(c, b); return { s, sh: sunShadow(c, s) }; });
  built.forEach(({ sh }) => out.push(poly(sh.polygon, 'd-block')));
  built.forEach(({ s, sh }) => {
    sh.right.forEach((r) => out.push(kit.line(r.base[0], r.base[1], vp[0], vp[1], { cls: 'd-guide', width: 1, dash: '4 5' })));
    out.push(drawBox(kit, s.b, { width: 2.4 }));
    out.push(kit.line(sh.right[0].tip[0], sh.right[0].tip[1], sh.right[1].tip[0], sh.right[1].tip[1], { width: 1.8 }));
  });
  return { out, c, built };
}

// A lamp scene. With `parallel`, the shadow is drawn the wrong way: its far edges kept parallel.
export function lampScene(kit, { f = 300, cy = 64, box = { x: -1.1, z: 4.8 }, L = [-2.8, -0.45, 4.5], parallel = false, labels = true } = {}) {
  const c = cam({ f, cy });
  const s = standing(c, box);
  const sh = lampShadow(c, s, L);
  const out = [kit.line(22, c.horizonY, 518, c.horizonY, { cls: 'd-mark', width: 1.2, dash: '5 5' })];
  let poly4 = sh.polygon;
  if (parallel) {
    // The edges run on in the box's own direction, as if the light were the sun.
    const [a, b, tipB, tipA] = [sh.right[0].base, sh.right[1].base, sh.right[1].tip, sh.right[0].tip];
    const dx = tipA[0] - a[0];
    poly4 = [a, b, [b[0] + dx * 0.9, b[1]], [a[0] + dx * 0.9, a[1]]];
  }
  out.push(poly(poly4, parallel ? 'd-block' : 'd-block'));
  if (!parallel) {
    sh.right.forEach((r) => {
      out.push(kit.line(sh.foot[0], sh.foot[1], r.tip[0], r.tip[1], { cls: 'd-guide', width: 1.3 }));
      out.push(kit.line(sh.lamp[0], sh.lamp[1], r.tip[0], r.tip[1], { cls: 'd-mark', width: 1.5 }));
    });
  }
  out.push(drawBox(kit, s.b, { width: 2.4 }));
  const p0 = poly4[2];
  const p1 = poly4[3];
  out.push(kit.line(p0[0], p0[1], p1[0], p1[1], { width: 1.8 }));
  out.push(kit.circle(sh.lamp[0], sh.lamp[1], 12, { width: 2.4 }));
  out.push(kit.line(sh.lamp[0], sh.lamp[1] + 12, sh.foot[0], sh.foot[1], { cls: 'd-guide', width: 1.3, dash: '3 4' }));
  out.push(kit.dot(sh.foot[0], sh.foot[1], { r: 3.8 }));
  if (labels) out.push(kit.text(sh.foot[0] - 10, sh.foot[1] + 18, 'foot', { anchor: 'end', size: 12 }), kit.text(sh.lamp[0] + 18, sh.lamp[1] - 12, 'lamp', { size: 12 }));
  return { out, c, s, sh };
}
