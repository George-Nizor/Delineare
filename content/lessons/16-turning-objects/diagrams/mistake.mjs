// The usual mistake: stretching and sliding the box instead of turning it. Left, two boxes whose
// edges run to the same vanishing point, so one is just the other moved. Right, a real turn: the
// edges run to a different point on the horizon. Each panel is one camera, so the points are real.
import { view } from './turn.js';
import { drawBox } from '../../12-plotted-boxes/diagrams/geom.js';

export default (kit) => {
  const panel = (px, specs) => {
    const base = { f: 100, z: 3.5, eye: 2.0, w: 2.2, d: 1.7, h: 1.4, cx: px + 128, cy: 96 };
    const boxes = specs.map(([yaw, x, w, cls]) => ({ o: view(yaw, { ...base, x, w }), cls }));
    const vps = boxes.map(({ o, cls }) => ({ p: o.vps.u, cls }));
    return [
      boxes.map(({ o, cls }) => o.body.edges.filter((e) => e.seen && e.axis === 'u').map((e) => {
        const p = o.body.corners[e.a];
        const q = o.body.corners[e.b];
        const far = p[0] > q[0] ? p : q;
        return kit.line(far[0], far[1], o.vps.u[0], o.vps.u[1], { cls, width: 1.3, dash: '4 4' });
      })),
      boxes.map(({ o }) => drawBox(kit, o.body, { width: 2.4 })),
      vps.map(({ p }) => kit.dot(p[0], boxes[0].o.horizon, { r: 4.4, cls: 'd-mark-fill' })),
      kit.line(px + 6, boxes[0].o.horizon, px + 250, boxes[0].o.horizon, { cls: 'd-mark', width: 1, dash: '5 5' }),
    ];
  };
  return kit.svg({ width: 560, height: 290 },
    kit.rect(16, 16, 256, 258, { rx: 3 }), kit.tag(144, 44, 'Moved and stretched', { tone: 'bad' }), panel(16, [[40, -1.9, 2.2, 'd-bad'], [40, 0.3, 3.2, 'd-bad']]),
    kit.rect(288, 16, 256, 258, { rx: 3 }), kit.tag(416, 44, 'Turned', { tone: 'mark' }), panel(288, [[40, -1.9, 2.2, 'd-mark'], [62, 0.3, 2.2, 'd-mark']]),
    kit.text(144, 262, 'one vanishing point', { anchor: 'middle', size: 12 }), kit.text(416, 262, 'two vanishing points', { anchor: 'middle', size: 12 }),
  );
};
