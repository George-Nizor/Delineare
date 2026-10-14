// Two more verticals, one each side, close the two faces. Their positions set the box's length in
// each direction.
import { frame, L0, R0, atX } from './geom.js';

export default (kit) => {
  const top = [270, 170];
  const bottom = [270, 280];
  const xa = 170;
  const xb = 390;
  const lt = atX(top, L0, xa);
  const lb = atX(bottom, L0, xa);
  const rt = atX(top, R0, xb);
  const rb = atX(bottom, R0, xb);
  return kit.svg({ width: 540, height: 330 }, frame(kit),
    kit.line(top[0], top[1], L0[0], L0[1], { cls: 'd-guide', width: 1.2 }), kit.line(bottom[0], bottom[1], L0[0], L0[1], { cls: 'd-guide', width: 1.2 }),
    kit.line(top[0], top[1], R0[0], R0[1], { cls: 'd-guide', width: 1.2 }), kit.line(bottom[0], bottom[1], R0[0], R0[1], { cls: 'd-guide', width: 1.2 }),
    kit.line(top[0], top[1], bottom[0], bottom[1], { width: 2.4 }),
    kit.line(lt[0], lt[1], lb[0], lb[1], { width: 2.4 }), kit.line(rt[0], rt[1], rb[0], rb[1], { width: 2.4 }),
    kit.line(lt[0], lt[1], top[0], top[1], { width: 2.4 }), kit.line(lb[0], lb[1], bottom[0], bottom[1], { width: 2.4 }),
    kit.line(rt[0], rt[1], top[0], top[1], { width: 2.4 }), kit.line(rb[0], rb[1], bottom[0], bottom[1], { width: 2.4 }),
    kit.text(170, 304, 'length one way', { anchor: 'middle', size: 12 }), kit.text(390, 304, 'length the other way', { anchor: 'middle', size: 12 }),
  );
};
