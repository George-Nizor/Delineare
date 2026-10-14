// A finished contour drawing: two real leaves on a stem, every bump, tooth and overlap followed.
import { observedLeaf } from './shared.mjs';

export default ({ svg, rect, smooth, polyline }) => {
  const one = observedLeaf(200, 172, 260, { turn: -28 });
  const two = observedLeaf(330, 150, 230, { turn: 34, bite: false });
  const draw = (leaf) => [
    smooth(leaf.outline, { width: 2 }),
    smooth(leaf.midrib, { width: 1.6 }),
    leaf.veins.map((vein) => smooth(vein, { width: 1.2 })),
    smooth(leaf.stem, { width: 2 }),
  ];
  return svg({ width: 540, height: 330 },
    rect(16, 14, 508, 302, { rx: 4 }),
    polyline([[226, 300], [250, 268], [262, 232]], { width: 2 }),
    draw(one), draw(two),
  );
};
