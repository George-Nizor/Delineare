// A sphere lit by one distant lamp, drawn as flat tonal zones, for lessons 18 and 19 (not a diagram
// itself). The zones are real: each is the set of points where the surface normal makes a given angle
// with the light, found by casting rays from the point that faces the lamp and bisecting. The cast
// shadow is the true ellipse the sphere's shadow makes on a flat table. Greys are fixed, so value is
// judged against a neutral ground in both themes.

export const G = {
  ground: '#969696', paper: '#dedede', castShadow: '#505050', core: '#262626', reflected: '#505050',
  half1: '#7a7a7a', half2: '#aaaaaa', half3: '#d2d2d2', centre: '#efefef', occlusion: '#0e0e0e', rim: '#6a6a6a',
};

const norm = (v) => { const n = Math.hypot(v.x, v.y, v.z); return { x: v.x / n, y: v.y / n, z: v.z / n }; };
export const LAMP = norm({ x: -0.74, y: 0.58, z: 0.26 });

export function sphere({ cx, cy, R, l = LAMP }) {
  // n = (dx / R, -dy / R, w), with w the part facing the viewer.
  const f = (dx, dy) => {
    const r2 = (dx * dx + dy * dy) / (R * R);
    return (dx * l.x - dy * l.y) / R + Math.sqrt(Math.max(0, 1 - r2)) * l.z;
  };
  const q = [l.x * R, -l.y * R];
  // The boundary of {f >= k}: along each ray from q, the last point still at or above k.
  const region = (k, steps = 180) => {
    const pts = [];
    for (let i = 0; i < steps; i += 1) {
      const t = (i / steps) * Math.PI * 2;
      const d = [Math.cos(t), Math.sin(t)];
      // Distance from q to the edge of the disc along d.
      const b = q[0] * d[0] + q[1] * d[1];
      const c = q[0] * q[0] + q[1] * q[1] - R * R;
      const rmax = -b + Math.sqrt(b * b - c);
      let lo = 0;
      let hi = rmax;
      if (f(q[0] + d[0] * hi, q[1] + d[1] * hi) >= k) lo = hi;
      else for (let j = 0; j < 30; j += 1) {
        const mid = (lo + hi) / 2;
        if (f(q[0] + d[0] * mid, q[1] + d[1] * mid) >= k) lo = mid; else hi = mid;
      }
      pts.push([cx + q[0] + d[0] * lo, cy + q[1] + d[1] * lo]);
    }
    return `M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} Z`;
  };
  const disc = `M ${cx - R} ${cy} A ${R} ${R} 0 1 0 ${cx + R} ${cy} A ${R} ${R} 0 1 0 ${cx - R} ${cy} Z`;
  // The terminator: the great circle where f = 0, drawn as the visible half of an ellipse.
  const terminator = () => {
    // Points with f = 0 on the visible hemisphere: normals perpendicular to l.
    const e1 = norm({ x: -l.y, y: l.x, z: 0 });
    const e2 = { x: l.y * e1.z - l.z * e1.y, y: l.z * e1.x - l.x * e1.z, z: l.x * e1.y - l.y * e1.x };
    const pts = [];
    for (let i = 0; i <= 90; i += 1) {
      const t = (i / 90) * Math.PI * 2;
      const n = { x: e1.x * Math.cos(t) + e2.x * Math.sin(t), y: e1.y * Math.cos(t) + e2.y * Math.sin(t), z: e1.z * Math.cos(t) + e2.z * Math.sin(t) };
      if (n.z >= 0) pts.push([cx + n.x * R, cy - n.y * R]);
    }
    return pts;
  };
  const contact = [cx, cy + R];
  // The cast shadow on a table: the ellipse where the sphere's shadow cylinder meets the floor. Table
  // depth is drawn at 0.38 of its length, as a camera looking down at it would.
  const k = 0.38;
  const shadow = () => {
    const sinA = l.y;
    const a = R / sinA;
    const hx = -l.x;
    const hz = -l.z;
    const hn = Math.hypot(hx, hz);
    const dir = [hx / hn, hz / hn];
    const perp = [-dir[1], dir[0]];
    const center = [(-l.x * R) / l.y, (-l.z * R) / l.y];
    const pts = [];
    for (let i = 0; i < 120; i += 1) {
      const t = (i / 120) * Math.PI * 2;
      const X = center[0] + dir[0] * a * Math.cos(t) + perp[0] * R * Math.sin(t);
      const Z = center[1] + dir[1] * a * Math.cos(t) + perp[1] * R * Math.sin(t);
      pts.push([contact[0] + X, contact[1] + Z * k]);
    }
    return pts;
  };
  return { f, region, disc, terminator, shadow, contact, q: [cx + q[0], cy + q[1]], cx, cy, R, l };
}

export const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
export const polyd = (pts) => `M ${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ')} Z`;
export const panel = (x, y, w, h, fill = G.ground) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="#7a7a7a" stroke-width="1"/>`;
export const at = (tx, ty, s, markup) => `<g transform="translate(${tx} ${ty}) scale(${s})">${[markup].flat(Infinity).join('')}</g>`;

// The occlusion shadow: a soft dark patch where the form meets the table.
export const occlusion = (s, id) => `<defs><radialGradient id="oc-${id}"><stop offset="0" stop-color="${G.occlusion}"/><stop offset="1" stop-color="${G.occlusion}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${s.contact[0] + s.R * 0.1}" cy="${s.contact[1] - 2}" rx="${s.R * 0.55}" ry="${s.R * 0.14}" fill="url(#oc-${id})"/>`;

// The finished sphere, up to a given stage:
//  'shadows': one flat dark for the form shadow and cast shadow, lit side bare.
//  'core': core shadow added, reflected light kept lighter.
//  'halftones': three halftones and the centre light.
//  'full': the occlusion shadow too.
export function paint(s, stage, id = 'a') {
  let out = '';
  out += path(polyd(s.shadow()), G.castShadow);
  if (stage === 'full') out += occlusion(s, id);
  out += path(s.disc, stage === 'shadows' ? G.reflected : G.reflected, `stroke="${G.rim}" stroke-width="0.8"`);
  if (stage === 'shadows') { out += path(s.region(0), G.paper); return out; }
  out += path(s.region(-0.3), G.core);
  if (stage === 'core') { out += path(s.region(0), G.paper); return out; }
  out += path(s.region(0), G.half1) + path(s.region(0.3), G.half2) + path(s.region(0.62), G.half3) + path(s.region(0.93), G.centre);
  return out;
}

const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const grey = (v) => `rgb(${v},${v},${v})`;

// The finished sphere with soft gradations, built from many thin steps: the light side passes
// gradually into the dark, the core shadow is darkest at the terminator and the reflected light
// lifts the shadow nearer the edge.
export function paintSoft(s, id = 'a') {
  let out = path(polyd(s.shadow()), G.castShadow) + occlusion(s, id);
  out += path(s.disc, G.reflected, `stroke="${G.rim}" stroke-width="0.8"`);
  // Shadow side: from reflected light (k = -0.5) to core shadow (k just below 0).
  for (let i = 0; i < 8; i += 1) {
    const k = -0.5 + (i * 0.5) / 8;
    const t = i / 7;
    out += path(s.region(k), grey(lerp(0x4c, 0x22, t)));
  }
  // Lit side: dark halftone at the terminator up to the centre light, compressed near the terminator.
  for (let i = 0; i < 16; i += 1) {
    const k = 0.0 + (i * 0.96) / 16;
    const t = Math.pow((i + 1) / 16, 0.62);
    out += path(s.region(k), grey(lerp(0x76, 0xee, t)));
  }
  return out;
}
