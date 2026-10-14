// A finished page of ghosted lines: most land on both dots, a few overshoot, one misses a little.
// None wobble.
export default ({ svg, rect, line, dot, random }) => {
  const next = random(11);
  const marks = [];
  const pairs = [
    [70, 70, 300, 52], [90, 120, 250, 250], [330, 90, 470, 230], [60, 270, 300, 300], [350, 270, 480, 120],
    [120, 190, 420, 170], [210, 60, 160, 290], [280, 240, 450, 290], [60, 160, 180, 80], [380, 50, 250, 140],
    [400, 300, 300, 200], [140, 300, 60, 210],
  ];
  pairs.forEach(([x1, y1, x2, y2], index) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    // Three overshoot by a few units and one ends just off its dot; the rest land.
    const over = [2, 5, 9].includes(index) ? 10 + next() * 8 : 0;
    const off = index === 7 ? 7 : 0;
    const ex = x2 + (dx / length) * over + (-dy / length) * off;
    const ey = y2 + (dy / length) * over + (dx / length) * off;
    marks.push(line(x1, y1, ex, ey, { width: 2 }));
  });
  const dots = pairs.flatMap(([x1, y1, x2, y2]) => [dot(x1, y1, { r: 3 }), dot(x2, y2, { r: 3 })]);
  return svg({ width: 540, height: 350 }, rect(20, 20, 500, 310, { rx: 4 }), marks, dots);
};
