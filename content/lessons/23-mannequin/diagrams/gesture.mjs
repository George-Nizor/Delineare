// Gesture: the whole pose in one or two long lines before any shape goes down.
import { keyPoints, mannequin, POSES } from './shared.mjs';

export default (kit) => {
  const o = { x: 150, floor: 212, s: 24 };
  const k = keyPoints(POSES.throw, 35, o);
  const line = kit.smooth([k.head, [(k.head[0] + k.rib[0]) / 2 - 3, (k.head[1] + k.rib[1]) / 2], k.rib, k.pel, [(k.pel[0] + k.hips[0][0]) / 2 - 8, (k.pel[1] + k.ankles[0][1]) / 2], k.ankles[0]], { cls: 'd-mark', width: 3.2 });
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 14, 320, 214, { rx: 3 }),
    mannequin(kit, POSES.throw, 35, { ...o, tone: 'guide', parts: ['torso', 'head', 'limbs'], width: 1.3 }),
    line,
    kit.text(236, 70, 'one long line', { size: 13 }),
    kit.text(236, 88, 'for the whole pose', { size: 13 }),
  );
};
