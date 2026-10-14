// Three-point: the camera looks down at a box, so its vertical edges converge on a point far below
// the horizon, as well as its two sets of horizontal edges running to the horizon.
import { camera, box, drawBox } from './geom.js';

export default (kit) => {
  const f = 170;
  const pitch = 0.75;
  const cy = 30 - camera({ f, cx: 270, cy: 0, pitch }).horizonY;
  const cam = camera({ f, cx: 270, cy, pitch });
  const b = box(cam, { at: [-1.9, -5.2, 4.8], w: 3.6, h: 3.8, d: 2.8, yaw: 0.6 });
  const vv = cam.vp([0, 1, 0]);
  const left = cam.vp(b.dirs.v);
  const hy = cam.horizonY;
  const c = b.corners;
  return kit.svg({ width: 540, height: 400 },
    kit.rect(16, 8, 508, 384, { rx: 4 }),
    kit.line(22, hy, 518, hy, { cls: 'd-mark', width: 1.6 }), kit.text(30, hy - 8, 'horizon', { size: 12 }),
    kit.dot(left[0], hy, { r: 4.5, cls: 'd-mark-fill' }), kit.text(left[0] + 8, hy + 18, 'one vanishing point', { size: 12 }),
    kit.text(512, hy + 18, 'the other is off the page', { anchor: 'end', size: 12 }),
    [0, 1, 4].map((i) => kit.line(c[i][0], c[i][1], vv[0], vv[1], { cls: 'd-guide', width: 1.3, dash: '4 5' })),
    drawBox(kit, b, { width: 2.2 }),
    kit.dot(vv[0], vv[1], { r: 4.8, cls: 'd-mark-fill' }),
    kit.text(vv[0] + 12, vv[1] + 4, 'vertical edges meet here', { size: 12 }),
  );
};
