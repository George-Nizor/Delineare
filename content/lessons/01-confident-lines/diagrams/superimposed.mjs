// Superimposed lines: eight freehand strokes over one ruled line, fraying only at the far end.
export default ({ svg, rect, line, random }) => {
  const next = random(3);
  const strokes = [];
  for (let i = 0; i < 8; i += 1) {
    const spread = (next() - 0.5) * 9;
    const reach = (next() - 0.3) * 14;
    strokes.push(line(60, 120 + (next() - 0.5) * 1.2, 470 + reach, 120 + spread, { width: 1.5 }));
  }
  return svg({ width: 540, height: 240 },
    rect(20, 20, 500, 200, { rx: 3 }),
    line(60, 120, 470, 120, { cls: 'd-guide', width: 3 }),
    strokes,
  );
};
