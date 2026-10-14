// The usual mistake: a detailed face and hand drawn before the pose is placed. The right way
// starts with the action line and the big masses.
import { keyPoints, mannequin, POSES } from './shared.mjs';

export default (kit) => {
  const o = { x: 416, floor: 204, s: 22 };
  const k = keyPoints(POSES.reach, 0, o);
  const line = kit.smooth([k.head, k.rib, k.pel, k.ankles[0]], { cls: 'd-mark', width: 3 });
  const face = [
    kit.circle(144, 98, 40, { width: 2 }), kit.ellipse(130, 92, 6, 3.4, { width: 1.8 }), kit.ellipse(158, 92, 6, 3.4, { width: 1.8 }),
    kit.polyline([[144, 94], [140, 108], [147, 108]], { width: 1.8 }), kit.smooth([[128, 120], [144, 126], [160, 120]], { width: 1.8 }),
    kit.circle(222, 170, 12, { width: 1.8 }), [0, 1, 2, 3].map((i) => kit.line(214 + i * 5.5, 160, 211 + i * 6.5, 138, { width: 1.8 })),
  ];
  return kit.svg({ width: 560, height: 230 },
    kit.rect(16, 12, 256, 206, { rx: 3 }), kit.tag(144, 30, 'Face and hands first', { tone: 'bad' }), face,
    kit.rect(288, 12, 256, 206, { rx: 3 }), kit.tag(416, 30, 'Action line and masses first'),
    mannequin(kit, POSES.reach, 0, { ...o, tone: 'guide', width: 1.3, parts: ['torso', 'head'] }), line,
  );
};
