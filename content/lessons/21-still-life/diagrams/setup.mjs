// Set up: seen from above, a lamp to one side of the group and you sitting in front of it. The
// light crosses the group and does not come from your side.
export default (kit) => kit.svg({ width: 360, height: 240 },
  kit.rect(20, 14, 320, 212, { rx: 3 }),
  kit.rect(112, 52, 190, 98, { cls: 'd-frame', stroke: 1.4 }),
  kit.text(207, 68, 'table', { anchor: 'middle', size: 11 }),
  kit.rect(138, 88, 30, 30, { cls: 'd-frame', stroke: 2 }),
  kit.circle(210, 100, 15, { width: 2 }),
  kit.circle(258, 108, 18, { width: 2 }),
  kit.circle(52, 100, 11, { cls: 'd-mark', width: 2 }),
  [[84, 76], [90, 100], [84, 124]].map(([x, y], i) => kit.line(66, 100, x + 40, y + (i - 1) * 6 - (i - 1) * 6, { cls: 'd-mark', width: 1.4, dash: '5 4' })),
  kit.text(52, 130, 'lamp', { anchor: 'middle', size: 12 }),
  kit.text(52, 146, 'at the side', { anchor: 'middle', size: 12 }),
  kit.circle(207, 192, 9, { width: 2 }),
  kit.line(207, 183, 160, 124, { cls: 'd-guide', width: 1.2, dash: '4 4' }),
  kit.line(207, 183, 258, 130, { cls: 'd-guide', width: 1.2, dash: '4 4' }),
  kit.text(228, 198, 'you', { size: 12 }),
);
