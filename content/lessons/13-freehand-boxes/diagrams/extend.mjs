// Extend the edges: from the far end of each edge, a ballpoint line continues back towards the
// vanishing point. How far it ends from the point shows how far the edge drifted.
import { handBox, drawHandBox } from './sketch.js';

export default (kit) => {
  const s = handBox({}, { slop: 2.4, seed: 8 });
  return kit.svg({ width: 540, height: 360 },
    kit.rect(16, 8, 508, 344, { rx: 4 }),
    drawHandBox(kit, s),
    kit.text(508, 336, 'the gap at each point shows the drift', { anchor: 'end', size: 12 }),
  );
};
