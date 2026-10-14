// A cylinder built in a box: an X across two opposite square faces finds their centres, the axis runs
// through both centres, and an ellipse fits each face touching all four edges.
import { camera, box, drawBox, circle3, add, mul } from '../../12-plotted-boxes/diagrams/geom.js';
import { ellipseOf, hand, along } from './cyl.js';

export default (kit) => {
  const cam = camera({ f: 430, cx: 270, cy: 190, pitch: 0.22 });
  const b = box(cam, { at: [-0.8, -1.9, 4.6], w: 4.6, h: 2.4, d: 2.4, yaw: 0.98 });
  const centre = (ids) => mul(ids.map((i) => b.world[i]).reduce((a, p) => add(a, p), [0, 0, 0]), 0.25);
  const ends = [[0, 2, 4, 6], [1, 3, 5, 7]];
  const c = ends.map(centre);
  const ell = c.map((p) => ellipseOf(circle3(cam, p, b.dirs.u, 1.2)));
  const p0 = cam.project(c[0]);
  const p1 = cam.project(c[1]);
  const a = along(p0, p1, -0.25);
  const z = along(p0, p1, 1.25);
  const pts = b.corners;
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }),
    drawBox(kit, b, { width: 2 }),
    [[0, 6, 2, 4], [1, 7, 3, 5]].map(([i, j, k, l]) => [kit.line(pts[i][0], pts[i][1], pts[j][0], pts[j][1], { cls: 'd-guide', width: 1.3 }), kit.line(pts[k][0], pts[k][1], pts[l][0], pts[l][1], { cls: 'd-guide', width: 1.3 })]),
    kit.line(a[0], a[1], z[0], z[1], { cls: 'd-mark', width: 1.8 }),
    ell.map((e, i) => hand(kit, e, 4 + i * 5, 2.4)),
  );
};
