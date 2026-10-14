// Follow every turn: a close-up of a toothed edge, followed tooth by tooth, beside the smooth curve
// a hurried hand puts in its place.
export default ({ svg, rect, polyline, smooth, tag }) => {
  const teeth = [];
  for (let i = 0; i <= 14; i += 1) teeth.push([46 + i * 19, 150 - Math.sin((i / 14) * Math.PI) * 70 - (i % 2 ? 9 : 0)]);
  const smoothed = [];
  for (let i = 0; i <= 14; i += 1) smoothed.push([46 + i * 19, 150 - Math.sin((i / 14) * Math.PI) * 66]);
  return svg({ width: 360, height: 240 },
    rect(20, 20, 320, 200, { rx: 3 }),
    smooth(smoothed.map(([x, y]) => [x, y + 46]), { cls: 'd-guide', width: 2, dash: '5 6' }),
    polyline(teeth, { width: 2.2 }),
    tag(180, 54, 'every tooth the edge has'),
    tag(180, 212, 'not the curve you expect', { tone: 'bad' }),
  );
};
