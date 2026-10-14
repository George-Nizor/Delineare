// Set up: a ruled frame, a horizon near its centre and a vanishing point near each end.
import { frame } from './geom.js';

export default (kit) => kit.svg({ width: 540, height: 330 }, frame(kit),
  kit.text(48, 178, 'vanishing point', { anchor: 'start', size: 12 }),
  kit.text(492, 178, 'vanishing point', { anchor: 'end', size: 12 }),
);
