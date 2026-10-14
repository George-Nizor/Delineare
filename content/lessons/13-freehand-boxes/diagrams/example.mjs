// A finished page: five boxes drawn freehand at different angles and sizes, each with its edges
// extended back towards its vanishing points in a second pen.
import { handBox, drawHandBox, placed } from './sketch.js';

export default (kit) => {
  const specs = [
    { o: { yaw: 0.9, pitch: 0.7 }, at: [130, 100, 0.62] },
    { o: { yaw: 0.5, pitch: 0.5, w: 4, h: 2.4, d: 2.6 }, at: [400, 96, 0.62] },
    { o: { yaw: 1.15, pitch: 0.6, w: 2.6, h: 3.6, d: 3.4 }, at: [270, 190, 0.6] },
    { o: { yaw: 0.7, pitch: 0.8 }, at: [110, 262, 0.6] },
    { o: { yaw: 1.3, pitch: 0.45, w: 3.8, h: 2.6, d: 3.4 }, at: [430, 268, 0.6] },
  ];
  const boxes = specs.map(({ o, at }, i) => {
    const s = handBox(o, { slop: 1.6, seed: 11 + i * 5 });
    return placed(s, at[0], at[1], at[2], drawHandBox(kit, s, { reach: 0.5, width: 3, marks: false }));
  });
  return kit.svg({ width: 540, height: 340 },
    kit.rect(16, 12, 508, 316, { rx: 4 }),
    `<svg x="16" y="12" width="508" height="316" viewBox="16 12 508 316">${boxes.join('')}</svg>`,
  );
};
