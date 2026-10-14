// Funnels: a ruled line through the middle, an arc each side, and ellipses threaded on the line
// like coins on a skewer. The line is every ellipse's minor axis, so it splits each one into
// matching halves across its narrow width. Here they also open up (rise in degree) toward the ends.
export default ({ svg, rect, line, smooth, handEllipse }) => {
  const [x0, x1, cy] = [70, 470, 122];
  const half = (x) => {
    const t = (x - x0) / (x1 - x0);
    return 34 + 60 * (2 * t - 1) ** 2;
  };
  const ratio = (x) => 0.22 + 0.3 * Math.abs(2 * ((x - x0) / (x1 - x0)) - 1);
  const arcs = [-1, 1].map((side) => {
    const points = [];
    for (let s = 0; s <= 24; s += 1) {
      const x = x0 + (s / 24) * (x1 - x0);
      points.push([x, cy + side * half(x)]);
    }
    return smooth(points, { width: 1.8 });
  });
  const ellipses = [];
  let x = x0;
  let seed = 50;
  while (x < x1 - 8) {
    let rx = ratio(x) * half(x);
    rx = ratio(x + rx) * half(x + rx);
    if (x + 2 * rx > x1 + 4) break;
    ellipses.push(handEllipse(x + rx, cy, rx - 0.8, half(x + rx) - 2.5, { passes: 2, seed: seed++, drift: 1.1, width: 1.4 }));
    x += 2 * rx;
  }
  return svg({ width: 540, height: 250 },
    rect(20, 16, 500, 218, { rx: 3 }),
    arcs, ellipses,
    line(50, cy, 490, cy, { cls: 'd-guide', width: 1.6 }),
    line(270, cy - 16, 270, cy + 16, { cls: 'd-guide', width: 1.6 }),
  );
};
