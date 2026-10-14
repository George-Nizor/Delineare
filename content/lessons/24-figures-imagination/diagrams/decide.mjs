// Decide: one sentence naming the action, and a gesture line for it.
import { keyPoints, mannequin, POSES } from './shared.mjs';

export default (kit) => {
  const o = { x: 130, floor: 214, s: 22 };
  const k = keyPoints(POSES.reach, 0, o);
  const line = kit.smooth([k.head, k.rib, k.pel, [(k.pel[0] + k.ankles[0][0]) / 2, (k.pel[1] + k.ankles[0][1]) / 2], k.ankles[0]], { cls: 'd-mark', width: 3 });
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 14, 320, 214, { rx: 3 }),
    mannequin(kit, POSES.reach, 0, { ...o, tone: 'guide', width: 1.2, parts: ['torso', 'head', 'limbs'] }),
    line,
    kit.line(200, 52, 320, 52, { width: 3 }), kit.rect(232, 30, 26, 22, { cls: 'd-frame', stroke: 1.6 }), kit.rect(266, 36, 20, 16, { cls: 'd-frame', stroke: 1.6 }),
    kit.text(260, 78, '"a person reaching', { anchor: 'middle', size: 12 }), kit.text(260, 94, 'up to a high shelf"', { anchor: 'middle', size: 12 }),
  );
};
