// Ghost: the pen moves through the line above the paper, several times, before it touches down.
// The passes hover above the path, each a little higher, with one arrow showing the direction.
export default ({ svg, rect, line, dot, arrowhead, text }) => {
  const [x1, y1, x2, y2] = [70, 172, 290, 122];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy);
  const nx = dy / length;
  const ny = -dx / length;
  const passes = [16, 30, 44].map((lift, index) => {
    const [ax, ay, bx, by] = [x1 + nx * lift + dx * 0.04, y1 + ny * lift + dy * 0.04, x2 + nx * lift - dx * 0.04, y2 + ny * lift - dy * 0.04];
    return [line(ax, ay, bx, by, { cls: 'd-mark', width: 2, dash: '7 6' }), index === 2 ? arrowhead(bx, by, Math.atan2(dy, dx)) : ''];
  });
  return svg({ width: 360, height: 240 },
    rect(20, 20, 320, 200, { rx: 3 }),
    line(x1, y1, x2, y2, { cls: 'd-guide', width: 1.6, dash: '4 6' }),
    passes,
    dot(x1, y1), dot(x2, y2),
    text(180, 208, 'pen off the paper, three or four passes', { anchor: 'middle', size: 13 }),
  );
};
