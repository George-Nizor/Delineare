// Side view: same pose turned to the side, with shoulders, hips and knees carried across at the
// same heights as in the front view.
import { keyPoints, mannequin, POSES } from './shared.mjs';

export default (kit) => {
  const a = { x: 100, floor: 214, s: 21 };
  const b = { x: 250, floor: 214, s: 21 };
  const k = keyPoints(POSES.reach, 0, a);
  const rows = [['shoulders', (k.shoulders[0][1] + k.shoulders[1][1]) / 2], ['hips', (k.hips[0][1] + k.hips[1][1]) / 2], ['knees', k.knees[0][1]], ['ankles', k.ankles[0][1]]];
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 14, 320, 214, { rx: 3 }),
    rows.map(([name, y]) => [kit.line(34, y, 326, y, { cls: 'd-mark', width: 1.2, dash: '5 4' }), kit.text(330, y - 3, name, { anchor: 'end', size: 11 })]),
    mannequin(kit, POSES.reach, 0, { ...a, width: 1.6 }),
    mannequin(kit, POSES.reach, 90, { ...b, width: 1.6 }),
  );
};
