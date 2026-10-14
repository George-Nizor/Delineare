// The usual mistake: the side plane drawn as a full circle on a turned head. It is a slice, so it
// narrows to an ellipse.
import { SLICE, head } from './shared.mjs';

export default (kit) => {
  const r = 68;
  const rs = Math.sqrt(1 - SLICE * SLICE) * r;
  return kit.svg({ width: 560, height: 230 },
    kit.rect(16, 12, 256, 206, { rx: 3 }), kit.tag(144, 30, 'Side plane as a circle', { tone: 'bad' }),
    head(kit, { x: 138, y: 124, r, yaw: 50, pitch: 8, layers: ['ball', 'cross'], width: 2 }),
    kit.circle(138 - SLICE * r * Math.cos((50 * Math.PI) / 180), 124, rs, { cls: 'd-bad', width: 2 }),
    kit.rect(288, 12, 256, 206, { rx: 3 }), kit.tag(416, 30, 'Side plane as an ellipse'),
    head(kit, { x: 410, y: 124, r, yaw: 50, pitch: 8, layers: ['ball', 'cross', 'plane'], width: 2 }),
  );
};
