// The usual mistake: an almond-shaped symbol for an eye. The right way draws the eyeball as a
// sphere set in a socket, with the lids wrapped over it.
export default (kit) => {
  const symbol = [
    kit.smooth([[56, 120], [90, 98], [140, 98], [176, 120]], { width: 2.4 }), kit.smooth([[56, 120], [90, 142], [140, 142], [176, 120]], { width: 2.4 }),
    kit.circle(116, 120, 14, { width: 2 }), kit.dot(116, 120, { r: 6 }),
  ];
  const cx = 412;
  const cy = 120;
  const real = [
    kit.polyline([[cx - 78, cy - 36], [cx + 70, cy - 36], [cx + 56, cy + 40], [cx - 66, cy + 40], [cx - 78, cy - 36]], { cls: 'd-guide', width: 1.4 }),
    kit.circle(cx, cy, 30, { width: 2 }),
    kit.smooth([[cx - 32, cy - 2], [cx - 18, cy - 24], [cx + 18, cy - 24], [cx + 32, cy - 2]], { width: 3 }),
    kit.smooth([[cx - 31, cy + 4], [cx - 16, cy + 22], [cx + 16, cy + 22], [cx + 31, cy + 4]], { width: 1.8 }),
    kit.ellipse(cx, cy - 2, 12, 10, { cls: 'd-guide', width: 1.4 }),
  ];
  return kit.svg({ width: 560, height: 230 },
    kit.rect(16, 12, 256, 206, { rx: 3 }), kit.tag(144, 30, 'A flat symbol', { tone: 'bad' }), symbol,
    kit.rect(288, 12, 256, 206, { rx: 3 }), kit.tag(416, 30, 'A sphere with lids'), real,
  );
};
