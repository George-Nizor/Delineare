// Leaves for this lesson's diagrams. Not a diagram itself.

// A real leaf, as observed: lopsided, toothed, with a bite out of one side and a tip that curls.
// Returns the outline, midrib, veins and stem as point lists in a box of `size` around (x, y).
export function observedLeaf(x, y, size, { turn = -12, bite = true } = {}) {
  const a = (turn * Math.PI) / 180;
  const place = ([u, v]) => [x + (u * Math.cos(a) - v * Math.sin(a)) * size, y + (u * Math.sin(a) + v * Math.cos(a)) * size];
  const length = 0.9;
  const width = (t, side) => {
    const base = Math.sin(Math.PI * t) ** 0.85 * (side > 0 ? 0.25 : 0.21);
    const teeth = t > 0.12 && t < 0.92 ? Math.abs(Math.sin(t * Math.PI * 13)) * 0.018 : 0;
    const nibble = bite && side < 0 && t > 0.46 && t < 0.62 ? -0.07 * Math.sin(((t - 0.46) / 0.16) * Math.PI) : 0;
    return Math.max(0, base + teeth + nibble);
  };
  const spine = (t) => [0.05 * Math.sin(t * Math.PI * 1.2) + (t > 0.85 ? (t - 0.85) * 0.9 : 0), 0.45 - t * length];
  const edge = (side) => {
    const points = [];
    for (let i = 0; i <= 60; i += 1) {
      const t = i / 60;
      const [sx, sy] = spine(t);
      points.push(place([sx + side * width(t, side), sy]));
    }
    return points;
  };
  const outline = [...edge(1), ...edge(-1).reverse()];
  const midrib = Array.from({ length: 21 }, (_, i) => place(spine((i / 20) * 0.96)));
  const veins = [0.22, 0.38, 0.54, 0.7].flatMap((t, k) => [1, -1].map((side) => {
    const [sx, sy] = spine(t);
    const reach = width(t + 0.08, side) * 0.8;
    return [place([sx, sy]), place([sx + side * reach * 0.6, sy - 0.05]), place([sx + side * reach, sy - 0.1 - k * 0.005])];
  }));
  const stem = [place(spine(0)), place([0.02, 0.52]), place([-0.03, 0.6])];
  return { outline, midrib, veins, stem };
}

// The symbol for a leaf: an even almond with a straight line down the middle and a stalk.
export function symbolLeaf(x, y, size) {
  const outline = [];
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    outline.push([x + Math.sin(Math.PI * t) * 0.22 * size, y + (0.42 - t * 0.84) * size]);
  }
  for (let i = 40; i >= 0; i -= 1) {
    const t = i / 40;
    outline.push([x - Math.sin(Math.PI * t) * 0.22 * size, y + (0.42 - t * 0.84) * size]);
  }
  return { outline, midrib: [[x, y + 0.42 * size], [x, y - 0.4 * size]], stem: [[x, y + 0.42 * size], [x, y + 0.56 * size]] };
}
