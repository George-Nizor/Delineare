// Ghost the ellipse: the pen circles above the paper, following the path, before touching down.
export default ({ svg, rect, ellipse, arcArrow, text }) => svg({ width: 360, height: 240 },
  rect(20, 20, 320, 200, { rx: 3 }),
  ellipse(180, 112, 92, 46, { cls: 'd-guide', width: 1.6, dash: '4 6' }),
  ellipse(180, 104, 92, 46, { cls: 'd-mark', width: 2, dash: '7 6' }),
  arcArrow(110, 75, 150, 61, { lift: -3 }),
  text(180, 200, 'pen off the paper, round and round', { anchor: 'middle', size: 13 }),
);
