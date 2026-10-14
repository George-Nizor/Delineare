// Plan: two dots, and the page turned so the line runs in the easiest direction.
export default ({ svg, group, rect, line, dot, arcArrow, text }) => svg({ width: 360, height: 240 },
  group({ rotate: [-22, 180, 120] },
    rect(60, 40, 240, 160, { rx: 3 }),
    line(110, 140, 250, 100, { cls: 'd-guide', width: 1.6, dash: '4 6' }),
    dot(110, 140), dot(250, 100),
  ),
  arcArrow(318, 168, 300, 214, { lift: 12 }),
  text(300, 232, 'turn the page', { anchor: 'end', size: 13 }),
);
