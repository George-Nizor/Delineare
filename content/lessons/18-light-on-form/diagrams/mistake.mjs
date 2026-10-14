// The usual mistake: lightening the shadow side until it is as bright as the halftones. The split
// between light and shadow goes, and the ball goes flat. Right: the shadow stays darker than any
// halftone, the way Proko's rule has it.
import { sphere, paint, panel, at, path, polyd, G } from './shade.js';

export default (kit) => {
  const s = sphere({ cx: 92, cy: 120, R: 56 });
  const weak = path(polyd(s.shadow()), '#8a8a8a')
    + path(s.disc, '#aaaaaa', 'stroke="#7a7a7a" stroke-width="0.8"')
    + path(s.region(0), G.half2) + path(s.region(0.3), G.half3) + path(s.region(0.62), G.centre) + path(s.region(0.93), '#f6f6f6');
  return kit.svg({ width: 560, height: 290 },
    panel(16, 16, 256, 224), weak,
    panel(288, 16, 256, 224), at(272, 0, 1, paint(s, 'full', 'mk')),
    kit.tag(144, 266, 'Shadow side too light', { tone: 'bad' }), kit.tag(416, 266, 'Shadow darker than every halftone', { tone: 'mark' }),
  );
};
