// The usual mistake: one slow pass that comes out lumpy and reaches for the edges, beside an
// ellipse drawn through twice at a steady speed.
export default ({ svg, rect, handEllipse, tag }) => svg({ width: 560, height: 220 },
  rect(16, 16, 256, 188, { rx: 3 }),
  tag(144, 48, 'Once, slow and careful', { tone: 'bad' }),
  rect(64, 76, 160, 96, { cls: 'd-frame', stroke: 1.4 }),
  handEllipse(144, 124, 78, 46, { passes: 1, lumpy: 7, seed: 12, drift: 0, start: 1.2 }),
  rect(288, 16, 256, 188, { rx: 3 }),
  tag(416, 48, 'Drawn through, steady'),
  rect(336, 76, 160, 96, { cls: 'd-frame', stroke: 1.4 }),
  handEllipse(416, 124, 78, 46, { passes: 2, seed: 8, drift: 2.2 }),
);
