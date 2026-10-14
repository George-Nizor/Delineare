// Shared by lesson 13's diagrams (not a diagram itself): a three-point box seen by a camera
// tipped down, with its three vanishing points, nearest corner and edge directions.
import { camera, box } from '../../12-plotted-boxes/diagrams/geom.js';

export function scene({ f = 150, pitch = 0.7, yaw = 0.9, w = 3.2, h = 3.0, d = 3.0, at = [-0.2, -3.6, 2.0], top = 26 } = {}) {
  const cy = top - camera({ f, cx: 0, cy: 0, pitch }).horizonY;
  const cam = camera({ f, cx: 270, cy, pitch });
  const b = box(cam, { at, w, h, d, yaw });
  const vps = { u: cam.vp(b.dirs.u), v: cam.vp(b.dirs.v), up: cam.vp(b.dirs.up) };
  // The nearest corner is the one the three visible faces share: the corner closest to the eye.
  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const dist = b.world.map((p) => p[2] * cosP - p[1] * sinP);
  const near = dist.indexOf(Math.min(...dist));
  return { cam, b, vps, near, horizon: cam.horizonY };
}

// Depth of corner i, to tell which end of an edge is nearer.
export const depth = (s, i) => {
  const p = s.b.world[i];
  return p[2] * Math.cos(s.cam.pitch) - p[1] * Math.sin(s.cam.pitch);
};
