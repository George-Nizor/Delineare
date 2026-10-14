// The usual mistake: a slow, steered line that wobbles and stops short, beside a fast line that
// overshoots. The fast one is the one to aim for.
export default ({ svg, rect, line, dot, wobblyLine, tag }) => svg({ width: 560, height: 220 },
  rect(16, 16, 256, 188, { rx: 3 }),
  tag(144, 48, 'Slow and careful', { tone: 'bad' }),
  wobblyLine(50, 160, 232, 102, { amount: 4, seed: 5, stop: 0.9 }),
  dot(50, 160), dot(232, 102),
  rect(288, 16, 256, 188, { rx: 3 }),
  tag(416, 48, 'Fast and sure'),
  line(322, 160, 518, 98),
  dot(322, 160), dot(504, 102),
);
