// Geometry shared by this lesson's diagrams. Not a diagram itself: no lesson or practice item
// refers to it by name.

// Half the width and half the height of the box around an ellipse turned by `angle` degrees.
export function extent(rx, ry, angle) {
  const t = (angle * Math.PI) / 180;
  return [Math.hypot(rx * Math.cos(t), ry * Math.sin(t)), Math.hypot(rx * Math.sin(t), ry * Math.cos(t))];
}

// A row of ellipses of one degree and angle filling a box from the left, each touching the next
// and the top and bottom of the box.
export function row(kit, x, y, w, h, { ratio = 1, angle = 0, seed = 1 } = {}) {
  const [ex, ey] = extent(1, ratio, angle);
  const scale = (h / 2 - 2) / ey;
  const rx = scale;
  const ry = scale * ratio;
  const half = ex * scale;
  const out = [];
  let index = 0;
  for (let cx = x + half + 2; cx + half <= x + w - 1; cx += half * 2) {
    out.push(kit.handEllipse(cx, y + h / 2, rx, ry, { angle, passes: 2, seed: seed + index * 7, drift: 1.4, width: 1.6 }));
    index += 1;
  }
  return out;
}
