import { useEffect, useRef, useState } from 'react';
import type * as Three from 'three';
import { ToolBar, type ToolHandle } from './common';
import { seeded } from '../references/prompts';

type Shape = 'box' | 'cylinder' | 'slab';
type View = 'one' | 'two' | 'three' | 'random';

interface Controls {
  shape: Shape;
  view: View;
  seed: number;
  lines: boolean;
}

// A box (or cylinder) in space with the horizon, the vanishing points and the lines that run to
// them drawn over it. Use it to see why a box converges the way it does, to check a drawing's
// vanishing points, and as the random-view drill: draw what you see, then turn the lines on.
export default function FormTool({ compact = false }: { compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const handle = useRef<ToolHandle<Controls> | null>(null);
  const [controls, setControls] = useState<Controls>({ shape: 'box', view: 'two', seed: 1, lines: true });
  const [failed, setFailed] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        if (cancelled || !host.current || !overlay.current) return;
        handle.current = buildScene(THREE, OrbitControls, host.current, overlay.current, controls);
      } catch (error) {
        setFailed((error as Error).message || '3D drawing is not available here.');
      }
    })();
    return () => { cancelled = true; handle.current?.dispose(); handle.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { handle.current?.update(controls); }, [controls]);

  const view = (next: View) => setControls((current) => ({ ...current, view: next, seed: next === 'random' ? current.seed + 1 : current.seed }));

  return (
    <div className="tool">
      <div ref={host} className="tool-stage" aria-label="A form in perspective with its horizon and vanishing points. Drag to look around." role="img">
        <canvas ref={overlay} className="tool-overlay" aria-hidden="true" />
        {failed ? <p className="viewer-message">{failed}</p> : null}
      </div>
      <ToolBar compact={compact}>
        <span className="segmented small" role="group" aria-label="View">
          {(['one', 'two', 'three'] as View[]).map((value) => (
            <button key={value} type="button" aria-pressed={controls.view === value} onClick={() => view(value)}>{value === 'one' ? '1-point' : value === 'two' ? '2-point' : '3-point'}</button>
          ))}
          <button type="button" aria-pressed={controls.view === 'random'} onClick={() => view('random')}>Random view</button>
        </span>
        <label>Form
          <select value={controls.shape} onChange={(event) => setControls({ ...controls, shape: event.target.value as Shape })}>
            <option value="box">Box</option>
            <option value="slab">Long slab</option>
            <option value="cylinder">Cylinder</option>
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={controls.lines} onChange={(event) => setControls({ ...controls, lines: event.target.checked })} />
          Horizon and vanishing lines
        </label>
      </ToolBar>
    </div>
  );
}

type OrbitConstructor = typeof import('three/examples/jsm/controls/OrbitControls.js').OrbitControls;

function buildScene(THREE: typeof Three, OrbitControls: OrbitConstructor, host: HTMLElement, overlay: HTMLCanvasElement, initial: Controls): ToolHandle<Controls> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.insertBefore(renderer.domElement, overlay);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x3b3b3b);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = false;
  orbit.minDistance = 3;
  orbit.maxDistance = 30;

  const grid = new THREE.GridHelper(40, 40, 0x6a6a6a, 0x4c4c4c);
  scene.add(grid);
  // A light from the upper left, so each face of the box takes a different tone.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x555555, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-6, 9, 4);
  scene.add(key);

  const material = new THREE.MeshStandardMaterial({ color: 0xc9c9c9, roughness: 0.9, transparent: true, opacity: 0.92 });
  const edges = new THREE.LineBasicMaterial({ color: 0x111111 });
  const form = new THREE.Group();
  scene.add(form);

  let size = new THREE.Vector3(2, 2, 2);
  const buildForm = (shape: Shape) => {
    for (const child of [...form.children]) { form.remove(child); (child as Three.Mesh).geometry.dispose(); }
    size = shape === 'slab' ? new THREE.Vector3(4, 0.8, 1.6) : new THREE.Vector3(2, 2, 2);
    const geometry = shape === 'cylinder' ? new THREE.CylinderGeometry(1, 1, 2, 64) : new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geometry, material);
    form.add(mesh, new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 30), edges));
    form.position.y = size.y / 2;
  };

  const context = overlay.getContext('2d')!;
  let showLines = initial.lines;
  // A shift lens for the level views: the frame slides down without tilting the camera, so the
  // form sits in the middle and verticals stay vertical, as with an architectural camera.
  let shift = 0;
  const applyShift = () => {
    const { clientWidth: width, clientHeight: height } = host;
    if (shift && width && height) camera.setViewOffset(width, height, 0, height * shift, width, height);
    else camera.clearViewOffset();
  };
  let shape: Shape = initial.shape;

  const project = (point: Three.Vector3) => {
    const view = point.clone().applyMatrix4(camera.matrixWorldInverse);
    const ndc = point.clone().project(camera);
    return { x: (ndc.x + 1) / 2 * overlay.width, y: (1 - ndc.y) / 2 * overlay.height, front: view.z < 0 };
  };

  // A vanishing point is where lines parallel to one of the form's edges meet: the image of the
  // point at infinity in that direction. Directions nearly parallel to the picture plane have none.
  const vanishing = (direction: Three.Vector3) => {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const facing = direction.dot(forward);
    if (Math.abs(facing) < 0.02) return null;
    const towards = facing > 0 ? direction : direction.clone().negate();
    const far = camera.position.clone().add(towards.clone().multiplyScalar(1e4));
    return project(far);
  };

  const drawOverlay = () => {
    const ratio = Math.min(window.devicePixelRatio, 2);
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, overlay.width, overlay.height);
    if (!showLines) return;
    context.lineWidth = 1.5 * ratio;
    // The horizon: eye level, where every horizontal direction vanishes.
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    const level = new THREE.Vector3(forward.x, 0, forward.z);
    if (level.lengthSq() > 1e-6) {
      const horizon = project(camera.position.clone().add(level.normalize().multiplyScalar(1e4)));
      if (horizon.front && horizon.y > -overlay.height && horizon.y < overlay.height * 2) {
        context.strokeStyle = 'rgba(210, 215, 146, 0.95)';
        context.setLineDash([]);
        context.beginPath(); context.moveTo(0, horizon.y); context.lineTo(overlay.width, horizon.y); context.stroke();
        context.fillStyle = 'rgba(210, 215, 146, 0.95)';
        context.font = `${12 * ratio}px "Spline Sans Mono", monospace`;
        context.fillText('horizon, eye level', 12 * ratio, horizon.y - 8 * ratio);
      }
    }
    if (shape === 'cylinder') return;
    // The form's three edge directions, and its eight corners.
    form.updateMatrixWorld();
    const axes = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)].map((axis) => axis.applyQuaternion(form.quaternion).normalize());
    const half = size.clone().multiplyScalar(0.5);
    const corners: Three.Vector3[] = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      corners.push(new THREE.Vector3(sx * half.x, sy * half.y, sz * half.z).applyMatrix4(form.matrixWorld));
    }
    const colours = ['rgba(136, 224, 246, 0.85)', 'rgba(242, 179, 94, 0.85)', 'rgba(181, 131, 235, 0.9)'];
    axes.forEach((axis, index) => {
      const point = vanishing(axis);
      if (!point || !point.front) return;
      const off = point.x < -overlay.width * 3 || point.x > overlay.width * 4 || point.y < -overlay.height * 3 || point.y > overlay.height * 4;
      if (off) return;
      context.strokeStyle = colours[index]!;
      context.setLineDash([6 * ratio, 6 * ratio]);
      for (const corner of corners) {
        const from = project(corner);
        context.beginPath(); context.moveTo(from.x, from.y); context.lineTo(point.x, point.y); context.stroke();
      }
      context.setLineDash([]);
      context.fillStyle = colours[index]!;
      context.beginPath(); context.arc(point.x, point.y, 6 * ratio, 0, Math.PI * 2); context.fill();
    });
  };

  const render = () => { renderer.render(scene, camera); drawOverlay(); };
  const resize = () => {
    const { clientWidth: width, clientHeight: height } = host;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const ratio = Math.min(window.devicePixelRatio, 2);
    overlay.width = Math.round(width * ratio);
    overlay.height = Math.round(height * ratio);
    camera.aspect = width / height;
    applyShift();
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  orbit.addEventListener('change', render);

  let current = { shape: '', view: '', seed: -1 };
  const update = (controls: Controls) => {
    showLines = controls.lines;
    if (controls.shape !== current.shape) { buildForm(controls.shape); shape = controls.shape; }
    if (controls.view !== current.view || controls.seed !== current.seed || controls.shape !== current.shape) {
      const centre = new THREE.Vector3(0, size.y / 2, 0);
      if (controls.view === 'one') {
        // Looking straight along one set of edges, level: one vanishing point, on the horizon.
        form.rotation.set(0, 0, 0);
        camera.position.set(1.4, size.y + 0.7, 9.5);
        orbit.target.set(1.4, size.y + 0.7, 0);
      } else if (controls.view === 'two') {
        // Turned, and looked at level from above its top: two vanishing points, verticals stay vertical.
        form.rotation.set(0, Math.PI / 5, 0);
        camera.position.set(0, size.y + 0.8, 10.5);
        orbit.target.set(0, size.y + 0.8, 0);
      } else if (controls.view === 'three') {
        form.rotation.set(0, Math.PI / 5, 0);
        camera.position.set(0, 9, 6);
        orbit.target.copy(centre);
      } else {
        const random = seeded(controls.seed * 7919);
        form.rotation.set(0, random() * Math.PI, 0);
        const angle = random() * Math.PI * 2;
        const height = -0.5 + random() * 7;
        camera.position.set(Math.sin(angle) * 8, Math.max(0.3, height), Math.cos(angle) * 8);
        orbit.target.copy(centre);
      }
      shift = controls.view === 'one' || controls.view === 'two' ? 0.2 : 0;
      applyShift();
      camera.updateProjectionMatrix();
      orbit.update();
    }
    current = { shape: controls.shape, view: controls.view, seed: controls.seed };
    render();
  };
  buildForm(initial.shape);
  update(initial);
  resize();

  return {
    update,
    dispose: () => {
      observer.disconnect();
      orbit.dispose();
      for (const child of form.children) (child as Three.Mesh).geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
