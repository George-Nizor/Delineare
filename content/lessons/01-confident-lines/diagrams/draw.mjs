// Draw: one stroke at ghosting speed, lifted off as it reaches the second dot.
export default ({ svg, rect, line, dot, arcArrow, text }) => svg({ width: 360, height: 240 },
  rect(20, 20, 320, 200, { rx: 3 }),
  line(70, 170, 290, 120),
  arcArrow(292, 119, 312, 84, { lift: -6 }),
  text(316, 78, 'lift', { anchor: 'end', size: 13 }),
  dot(70, 170), dot(290, 120),
);
