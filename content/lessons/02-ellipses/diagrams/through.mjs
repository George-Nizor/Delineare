// Draw through: two passes round the ellipse before the pen lifts.
export default ({ svg, rect, handEllipse, text }) => svg({ width: 360, height: 240 },
  rect(20, 20, 320, 200, { rx: 3 }),
  handEllipse(180, 112, 96, 50, { passes: 2, seed: 4, drift: 7, width: 2 }),
  text(180, 200, 'two passes, one movement', { anchor: 'middle', size: 13 }),
);
