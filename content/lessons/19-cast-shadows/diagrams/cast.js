// Cast shadows of boxes, for lesson 19's diagrams (not a diagram itself). One camera at eye level
// with the horizon at cy, a box standing on the floor with its front face square to us, and either
// the sun in the picture plane at 45 degrees (Storey's case) or a lamp with its foot on the floor.
// Every shadow point comes from intersecting the same lines Storey draws: a ray from the light over
// a top corner, and a floor line from the foot of the light through the base corner below.
import { camera, box } from '../../12-plotted-boxes/diagrams/geom.js';

export const EYE = 3.4;
export const cam = ({ f = 300, cy = 64 } = {}) => camera({ f, cx: 270, cy, pitch: 0 });

// A box with its front-left base corner at (x, z), width w, depth d and height h.
export function standing(c, { x, z, w = 1.3, d = 1.3, h = 1.6 }) {
  const b = box(c, { at: [x, -EYE, z], w, h, d, yaw: 0 });
  const P = (i) => b.corners[i];
  // Corner bits: 1 along x, 2 up, 4 deep.
  return { b, h, x, z, w, d, P, base: (i) => b.world[i & ~2], top: (i) => b.world[i | 2] };
}

// The sun in the picture plane at 45 degrees: a top corner's shadow is the point the same distance
// to the right on the floor as the corner is high.
export function sunShadow(c, s) {
  const tip = (i) => {
    const t = s.b.world[i | 2];
    return c.project([t[0] + s.h, -EYE, t[2]]);
  };
  const right = [1, 5].map((i) => ({ base: c.project(s.b.world[i]), tip: tip(i), top: c.project(s.b.world[i | 2]) }));
  return { right, polygon: [right[0].base, right[0].tip, right[1].tip, right[1].base] };
}

// A lamp at L with its foot on the floor below it. The tip for a top corner T is where the ray from
// L through T meets the floor.
export function lampShadow(c, s, L) {
  const tipOf = (i) => {
    const T = s.b.world[i | 2];
    const t = (L[1] + EYE) / (L[1] - T[1]);
    return c.project([L[0] + t * (T[0] - L[0]), -EYE, L[2] + t * (T[2] - L[2])]);
  };
  const corners = [1, 5];
  const right = corners.map((i) => ({ base: c.project(s.b.world[i]), tip: tipOf(i), top: c.project(s.b.world[i | 2]) }));
  return { right, foot: c.project([L[0], -EYE, L[2]]), lamp: c.project(L), polygon: [right[0].base, right[0].tip, right[1].tip, right[1].base] };
}

export const poly = (pts, cls) => `<path d="M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} Z" class="${cls}"/>`;
