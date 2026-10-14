// Step five: rebuild the object's forms inside the turned box. The smaller form on top is placed
// against the box's corners, in the new view.
import { view } from './turn.js';
import { drawBox } from '../../12-plotted-boxes/diagrams/geom.js';

export default (kit) => {
  const b = view(60);
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 10, 508, 320, { rx: 4 }),
    kit.line(22, b.horizon, 518, b.horizon, { cls: 'd-mark', width: 1.3, dash: '6 6' }),
    drawBox(kit, b.body, { width: 1.8, cls: 'd-guide', hiddenCls: 'd-guide' }),
    drawBox(kit, b.lid, { width: 2.8 }),
    drawBox(kit, b.body, { width: 2.2, through: false }),
    kit.text(270, 322, 'forms rebuilt inside the turned box', { anchor: 'middle', size: 13 }),
  );
};
