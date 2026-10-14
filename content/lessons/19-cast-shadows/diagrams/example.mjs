// A finished page: the same box twice, with the shadow the sun makes (parallel edges, as long as the
// box is tall) and the shadow a lamp makes (edges that spread away from the box).
import { sunScene, lampScene } from './scenes.js';

export default (kit) => {
  const sc = 0.62;
  const clip = (x, y, w, h, inner) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}">${inner}</svg>`;
  const place0 = (x, art) => `<g transform="translate(${x + 8 - 80 * sc} ${72 - 70 * sc}) scale(${sc})">${art.flat(Infinity).join('')}</g>`;
  const place = (x, art) => clip(x, 16, 256, 270, place0(x, art));
  return kit.svg({ width: 560, height: 300 },
    kit.rect(16, 16, 256, 270, { rx: 3 }), place(16, sunScene(kit, { box: { x: -1.9, z: 4.6 } }).out), kit.tag(144, 44, 'Sun', { tone: 'mark' }),
    kit.rect(288, 16, 256, 270, { rx: 3 }), place(288, lampScene(kit, { labels: false }).out), kit.tag(416, 44, 'Lamp', { tone: 'mark' }),
  );
};
