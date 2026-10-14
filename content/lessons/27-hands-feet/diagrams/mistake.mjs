// The usual mistake: four equal tubes for fingers. Fingers taper, and the middle finger is the
// longest, so the fingertips follow a curve.
import { hand } from './shared.mjs';

export default (kit) => kit.svg({ width: 560, height: 230 },
  kit.rect(16, 12, 256, 206, { rx: 3 }), kit.tag(144, 30, 'Four even tubes', { tone: 'bad' }),
  hand(kit, { x: 144, y: 190, s: 74, view: { yaw: 0, pitch: 0 }, layers: ['palm', 'fingers'], equalTubes: true, width: 1.8 }),
  kit.rect(288, 12, 256, 206, { rx: 3 }), kit.tag(416, 30, 'Tapering, middle longest'),
  hand(kit, { x: 416, y: 190, s: 74, view: { yaw: 0, pitch: 0 }, layers: ['palm', 'fingers'], width: 1.8 }),
);
