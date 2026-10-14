// The usual mistake: the leaf symbol learned as a child, beside the edge of a real leaf.
import { observedLeaf, symbolLeaf } from './shared.mjs';

export default ({ svg, rect, smooth, line, polyline, tag }) => {
  const symbol = symbolLeaf(144, 128, 150);
  const real = observedLeaf(416, 132, 170, { turn: -14 });
  return svg({ width: 560, height: 230 },
    rect(16, 16, 256, 198, { rx: 3 }),
    tag(144, 44, 'The symbol you know', { tone: 'bad' }),
    smooth(symbol.outline, { width: 2 }),
    polyline(symbol.midrib, { width: 1.6 }),
    line(...symbol.stem[0], ...symbol.stem[1], { width: 2 }),
    rect(288, 16, 256, 198, { rx: 3 }),
    tag(416, 44, 'The leaf you see'),
    smooth(real.outline, { width: 2 }),
    smooth(real.midrib, { width: 1.5 }),
    real.veins.map((vein) => smooth(vein, { width: 1.1 })),
    smooth(real.stem, { width: 2 }),
  );
};
