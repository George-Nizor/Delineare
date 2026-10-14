// Leave it: a line that missed its dot stays as it is, and the next line gets a fresh pair of dots.
export default ({ svg, rect, line, dot, text }) => svg({ width: 360, height: 240 },
  rect(20, 20, 320, 200, { rx: 3 }),
  line(50, 160, 176, 118),
  dot(50, 160), dot(172, 104),
  text(110, 196, 'missed: leave it', { anchor: 'middle', size: 13 }),
  dot(214, 150), dot(312, 70),
  line(214, 150, 312, 70, { cls: 'd-guide', width: 1.6, dash: '4 6' }),
  text(264, 196, 'plan the next one', { anchor: 'middle', size: 13 }),
);
