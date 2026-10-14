// Ellipses in planes: lopsided four-sided shapes, each with an ellipse touching all four sides.
// Each shape is built from four lines tangent to its ellipse, so the fit is exact.
function plane(cx, cy, rx, ry, angle, params) {
  const a = (angle * Math.PI) / 180;
  const at = (t) => {
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    return [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)];
  };
  const tangent = (t) => {
    const dx = -rx * Math.sin(t);
    const dy = ry * Math.cos(t);
    return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a)];
  };
  const lines = params.map((t) => [at(t), tangent(t)]);
  const corners = lines.map(([[px, py], [dx, dy]], i) => {
    const [[qx, qy], [ex, ey]] = lines[(i + 1) % lines.length];
    const det = dx * ey - dy * ex;
    const s = ((qx - px) * ey - (qy - py) * ex) / det;
    return [px + dx * s, py + dy * s];
  });
  return corners;
}

export default ({ svg, rect, polyline, handEllipse }) => {
  const shapes = [
    { cx: 150, cy: 124, rx: 82, ry: 56, angle: -8, params: [0.35, 1.75, 3.35, 4.85] },
    { cx: 392, cy: 124, rx: 88, ry: 42, angle: -20, params: [0.1, 2, 3.3, 5.1] },
  ];
  return svg({ width: 540, height: 240 },
    rect(20, 16, 500, 210, { rx: 3 }),
    shapes.map(({ cx, cy, rx, ry, angle, params }, i) => {
      const corners = plane(cx, cy, rx, ry, angle, params);
      return [
        polyline([...corners, corners[0]], { width: 1.8 }),
        handEllipse(cx, cy, rx, ry, { angle, passes: 2, seed: 3 + i * 3, drift: 1.6 }),
      ];
    }),
  );
};
