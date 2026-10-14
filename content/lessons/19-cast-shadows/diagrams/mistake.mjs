// The usual mistake: drawing a lamp's shadow with parallel edges, as if the lamp were the sun. Right:
// the rays spread out from a lamp, so the shadow widens away from the box.
import { lampScene } from './scenes.js';

export default (kit) => {
  const sc = 0.62;
  const clip = (x, y, w, h, inner) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}">${inner}</svg>`;
  const place0 = (x, art) => `<g transform="translate(${x + 8 - 80 * sc} ${70 - 70 * sc}) scale(${sc})">${art.flat(Infinity).join('')}</g>`;
  const place = (x, art) => clip(x, 16, 256, 258, place0(x, art));
  const bad = lampScene(kit, { parallel: true, labels: false }).out;
  const good = lampScene(kit, { labels: false }).out;
  return kit.svg({ width: 560, height: 290 },
    kit.rect(16, 16, 256, 258, { rx: 3 }), kit.tag(144, 44, 'Edges kept parallel', { tone: 'bad' }), place(16, bad),
    kit.rect(288, 16, 256, 258, { rx: 3 }), kit.tag(416, 44, 'Edges spreading', { tone: 'mark' }), place(288, good),
  );
};
