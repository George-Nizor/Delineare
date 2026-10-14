// Two boxes of about equal length, width and height that overlap at a corner. The intersection is
// the loop of six lines where the surface of one meets the surface of the other. Each of its points
// is on both boxes.
import { camera, box, drawBox, add, mul } from '../../12-plotted-boxes/diagrams/geom.js';

export default (kit) => {
  const cam = camera({ f: 520, cx: 270, cy: 330, pitch: 0.32 });
  const yaw = 0.62;
  const s = 2.2;
  const A = box(cam, { at: [-1.4, -2.0, 6.0], w: s, h: s, d: s, yaw });
  // Box B is A's size, moved half a box along each of its three axes.
  const at0 = A.world[0];
  const { u, v, up } = A.dirs;
  const shift = add(add(mul(u, s * 0.5), mul(up, s * 0.5)), mul(v, s * 0.5));
  const B = box(cam, { at: add(at0, shift), w: s, h: s, d: s, yaw });
  // The overlap is the cube [0.5, 1] of box A in each axis. Its loop of six edges, in A's units.
  const loop = [[1, 0.5, 0.5], [1, 0.5, 1], [0.5, 0.5, 1], [0.5, 1, 1], [0.5, 1, 0.5], [1, 1, 0.5]];
  const world = (a, b, c) => add(at0, add(add(mul(u, s * a), mul(up, s * b)), mul(v, s * c)));
  // In A's local frame the axes are (u, up, v) = (a, b, c); the loop above used (x, y, z) = (a, b, c).
  const pts = loop.map(([a, b, c]) => cam.project(world(a, b, c)));
  const d = `M ${pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ')} Z`;
  return kit.svg({ width: 540, height: 360 }, kit.rect(16, 8, 508, 344, { rx: 4 }),
    drawBox(kit, A, { width: 2 }), drawBox(kit, B, { width: 2 }),
    kit.path(d, { cls: 'd-mark', width: 3 }),
  );
};
