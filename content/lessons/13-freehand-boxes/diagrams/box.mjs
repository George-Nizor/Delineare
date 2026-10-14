// The finished box: all twelve edges, the hidden ones drawn through, each set of edges aimed at its
// own vanishing point.
import { drawBox } from '../../12-plotted-boxes/diagrams/geom.js';
import { scene } from './scene.js';

export default (kit) => {
  const s = scene();
  return kit.svg({ width: 540, height: 360 },
    kit.rect(16, 8, 508, 344, { rx: 4 }),
    ['u', 'v', 'up'].map((k) => kit.dot(s.vps[k][0], s.vps[k][1], { r: 4.5, cls: 'd-mark-fill' })),
    drawBox(kit, s.b, { width: 2.4 }),
    kit.line(s.b.corners[s.near][0], s.b.corners[s.near][1], 112, s.b.corners[s.near][1], { cls: 'd-mark', width: 1.2 }), kit.text(108, s.b.corners[s.near][1] + 4, 'nearest corner', { anchor: 'end', size: 12 }),
  );
};
