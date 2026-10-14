// An object (a box with a smaller box on top) turned about its vertical axis, for lesson 16's
// diagrams (not a diagram itself). The nearest corner stays put, as Norton's cube does, so the
// nearest vertical edge keeps its length and height on the page while everything else swings.
import { camera, box, drawBox, add, mul } from '../../12-plotted-boxes/diagrams/geom.js';

export const rad = (deg) => (deg * Math.PI) / 180;

export function view(yawDeg, { f = 330, cx = 270, x = 0, cy = 70, eye = 4.2, z = 7.5, w = 4.3, d = 3.2, h = 2.5 } = {}) {
  const cam = camera({ f, cx, cy, pitch: 0 });
  const yaw = rad(yawDeg);
  const at = [x, -eye, z];
  const body = box(cam, { at, w, h, d, yaw });
  // A smaller box set on top, inset from the corner by a third of each side.
  const { u, v } = body.dirs;
  const lid = box(cam, { at: add(add(at, [0, h, 0]), add(mul(u, w * 0.18), mul(v, d * 0.22))), w: w * 0.5, h: h * 0.55, d: d * 0.5, yaw });
  return { cam, body, lid, yaw, vps: { u: cam.vp(u), v: cam.vp(v) }, near: body.corners[0], nearTop: body.corners[2], horizon: cam.horizonY };
}

export function draw(kit, o, opts = {}) {
  return [drawBox(kit, o.body, opts), drawBox(kit, o.lid, opts)];
}
