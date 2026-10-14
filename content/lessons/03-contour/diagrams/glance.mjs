// Look little, look often: most of the time on the object, with short glances at the page.
export default ({ svg, rect, text }) => {
  const plan = [['object', 46], ['page', 7], ['object', 52], ['page', 6], ['object', 44], ['page', 7], ['object', 48], ['page', 6]];
  const scale = 292 / plan.reduce((sum, [, width]) => sum + width, 0);
  let x = 34;
  const bars = plan.map(([where, width]) => {
    const bar = rect(x, where === 'object' ? 96 : 132, width * scale - 2, 22, { cls: where === 'object' ? 'd-block' : 'd-block-mark', stroke: 0 });
    x += width * scale;
    return bar;
  });
  return svg({ width: 360, height: 240 },
    rect(20, 20, 320, 200, { rx: 3 }),
    text(34, 86, 'eyes on the object', { size: 13 }),
    text(34, 172, 'short glances at the page', { size: 13 }),
    bars,
  );
};
