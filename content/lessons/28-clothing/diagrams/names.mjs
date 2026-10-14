
// The seven fold shapes, each as a small panel. Names and descriptions follow the Clip Studio TIPS article.
export default ({ svg, rect, line, path, smooth, dot, ellipse, text, polyline }) => {
  const panels = [];
  const frame = (ox, oy, label) => [rect(ox, oy, 132, 136, { rx: 3 }), text(ox + 66, oy + 126, label, { cls: 'd-label', anchor: 'middle', size: 14 })];
  const at = (ox, oy, pts) => pts.map(([x, y]) => [ox + x, oy + y]);
  const S = (ox, oy, pts, w = 2) => smooth(at(ox, oy, pts), { width: w });
  const L = (ox, oy, a, b, w = 2) => line(ox + a[0], oy + a[1], ox + b[0], oy + b[1], { width: w });
  // 1 pipe: tubes of excess cloth hanging from a rod
  { const [ox, oy] = [10, 10];
    panels.push(frame(ox, oy, 'pipe'), L(ox, oy, [16, 16], [116, 16], 2.4));
    [30, 52, 74, 96].forEach((cx, i) => { const end = i % 2 ? 90 : 80;
      panels.push(L(ox, oy, [cx - 9, 18], [cx - 9, end]), L(ox, oy, [cx + 9, 18], [cx + 9, end]), S(ox, oy, [[cx - 9, end], [cx, end + 8], [cx + 9, end]])); }); }
  // 2 drop: cones spreading from one point
  { const [ox, oy] = [152, 10];
    panels.push(frame(ox, oy, 'drop'), dot(ox + 66, oy + 16, { r: 4.5, cls: 'd-dot' }));
    [[24, 90], [62, 98], [108, 90]].forEach(([x, y]) => panels.push(L(ox, oy, [66, 16], [x, y])));
    panels.push(S(ox, oy, [[24, 90], [44, 102], [62, 98]]), S(ox, oy, [[62, 98], [88, 104], [108, 90]])); }
  // 3 diaper: a bridge of cloth between two points
  { const [ox, oy] = [294, 10];
    panels.push(frame(ox, oy, 'diaper'), dot(ox + 22, oy + 18, { r: 4.5, cls: 'd-dot' }), dot(ox + 110, oy + 18, { r: 4.5, cls: 'd-dot' }));
    [[22, 18, 66, 96, 110, 18], [30, 20, 66, 72, 102, 20], [38, 22, 66, 52, 94, 22]].forEach(([x1, y1, cx, cy, x2, y2]) => panels.push(path(`M ${ox + x1} ${oy + y1} Q ${ox + cx} ${oy + cy} ${ox + x2} ${oy + y2}`, { width: 2 })));
    panels.push(L(ox, oy, [22, 18], [18, 70]), L(ox, oy, [110, 18], [114, 70])); }
  // 4 zigzag: cloth squeezed lightly on itself
  { const [ox, oy] = [436, 10];
    panels.push(frame(ox, oy, 'zigzag'));
    [30, 52, 74].forEach((y, i) => panels.push(polyline(at(ox, oy, [[16, y + (i % 2 ? 6 : 0)], [40, y + 18], [64, y - 4 + (i % 2 ? 6 : 0)], [88, y + 18], [116, y + 2 + (i % 2 ? 6 : 0)]]), { width: 2 }))); }
  // 5 spiral: cloth twisted round a limb
  { const [ox, oy] = [81, 156];
    panels.push(frame(ox, oy, 'spiral'), L(ox, oy, [18, 26], [112, 26]), L(ox, oy, [18, 86], [112, 86]), ellipse(ox + 18, oy + 56, 7, 30, { width: 2 }));
    [38, 62, 86].forEach((x) => panels.push(S(ox, oy, [[x, 26], [x + 12, 44], [x + 4, 66], [x + 14, 86]], 2))); }
  // 6 half-lock: cloth where the form underneath turns sharply
  { const [ox, oy] = [223, 156];
    panels.push(frame(ox, oy, 'half-lock'), polyline(at(ox, oy, [[18, 18], [86, 18], [86, 104]]), { width: 2 }), polyline(at(ox, oy, [[18, 46], [58, 46], [58, 104]]), { width: 2 }));
    panels.push(S(ox, oy, [[58, 46], [66, 60], [76, 66]], 1.8), S(ox, oy, [[58, 46], [62, 68], [70, 82]], 1.8), S(ox, oy, [[58, 46], [72, 52], [84, 52]], 1.8), S(ox, oy, [[34, 46], [40, 36], [46, 30]], 1.6)); }
  // 7 inert: cloth lying where it fell
  { const [ox, oy] = [365, 156];
    panels.push(frame(ox, oy, 'inert'), L(ox, oy, [10, 98], [122, 98], 1.6), smooth(at(ox, oy, [[16, 98], [24, 80], [40, 70], [56, 56], [76, 62], [94, 74], [108, 88], [116, 98]]), { width: 2 }));
    panels.push(S(ox, oy, [[30, 90], [48, 80], [64, 82]], 1.6), S(ox, oy, [[56, 60], [62, 74], [80, 88]], 1.6), S(ox, oy, [[84, 70], [92, 82], [104, 92]], 1.6)); }
  return svg({ width: 576, height: 312 }, panels);
};
