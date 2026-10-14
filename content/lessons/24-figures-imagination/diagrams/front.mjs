// Front view: the mannequin built on the gesture, with the head used as the unit of height.
import { mannequin, POSES, projector } from './shared.mjs';

export default (kit) => {
  const o = { x: 170, floor: 220, s: 22 };
  const P = projector(0, o);
  const ticks = [];
  for (let i = 0; i <= 7; i += 1) {
    const y = P([0, 7.5 - i, 0])[1];
    ticks.push(kit.line(50, y, 62, y, { width: 1.6, cls: 'd-guide' }));
    if (i < 7) ticks.push(kit.text(44, y + 15, String(i + 1), { anchor: 'end', size: 11 }));
  }
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 14, 320, 214, { rx: 3 }),
    kit.line(56, P([0, 7.5, 0])[1], 56, P([0, 0, 0])[1], { cls: 'd-guide', width: 1.4 }), ticks,
    mannequin(kit, POSES.reach, 0, o),
    kit.text(236, 120, 'bean first,', { size: 13 }), kit.text(236, 138, 'then the limbs', { size: 13 }),
  );
};
