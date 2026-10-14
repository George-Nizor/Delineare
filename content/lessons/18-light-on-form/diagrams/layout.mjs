// Step two: the form drawn lightly, the terminator (where it turns from light to shadow) marked, and
// the outline of the cast shadow sketched.
import { sphere, polyd } from './shade.js';

export default (kit) => {
  const s = sphere({ cx: 190, cy: 150, R: 100 });
  const term = s.terminator();
  return kit.svg({ width: 540, height: 340 }, kit.rect(16, 8, 508, 324, { rx: 4 }),
    kit.path(polyd(s.shadow()), { cls: 'd-ink', width: 1.6 }),
    kit.circle(s.cx, s.cy, s.R, { width: 2 }),
    kit.polyline(term, { cls: 'd-mark', width: 2.6 }),
    kit.text(418, 96, 'terminator', { anchor: 'start', size: 13, cls: 'd-tag' }), kit.line(412, 94, 296, 120, { cls: 'd-mark', width: 1.2 }),
    kit.text(418, 300, 'cast shadow outline', { anchor: 'middle', size: 13 }),
  );
};
