// Set the target: the space the ellipse must fill, marked before drawing.
export default ({ svg, rect, ellipse, line, text }) => svg({ width: 360, height: 240 },
  rect(20, 20, 320, 200, { rx: 3 }),
  rect(90, 70, 180, 90, { cls: 'd-frame', stroke: 1.6 }),
  ellipse(180, 115, 88, 43, { cls: 'd-guide', width: 1.6, dash: '5 6' }),
  line(180, 64, 180, 166, { cls: 'd-mark', width: 1.6, dash: '3 5' }),
  text(180, 196, 'the box, and the ellipse you mean to fit in it', { anchor: 'middle', size: 13 }),
);
