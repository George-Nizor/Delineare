// Three-quarter view: a box turned halfway between front and side, with diagonals to find its
// middle, and the mannequin built inside it.
import { mannequin, POSES, projector } from './shared.mjs';

export default (kit) => {
  const o = { x: 170, floor: 214, s: 21 };
  const P = projector(45, o);
  const w = 1.5;
  const d = 1.1;
  const h = 8.6;
  const corner = (cx, cz, y) => P([cx * w, y, cz * d]);
  const out = [];
  for (const [ax, az, bx, bz] of [[-1, 1, 1, 1], [1, 1, 1, -1]]) {
    const q = [corner(ax, az, 0), corner(bx, bz, 0), corner(bx, bz, h), corner(ax, az, h)];
    out.push(kit.polyline([...q, q[0]], { cls: 'd-guide', width: 1.3 }));
    out.push(kit.line(...q[0], ...q[2], { cls: 'd-guide', width: 1, dash: '4 4' }), kit.line(...q[1], ...q[3], { cls: 'd-guide', width: 1, dash: '4 4' }));
  }
  return kit.svg({ width: 360, height: 240 },
    kit.rect(20, 14, 320, 214, { rx: 3 }),
    out,
    mannequin(kit, POSES.reach, 45, { ...o, width: 1.6 }),
    kit.text(236, 110, 'a box round the figure,', { size: 12 }), kit.text(236, 126, 'cut by diagonals', { size: 12 }),
  );
};
