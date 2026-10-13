import { useEffect, useRef, useState } from 'react';
import type * as Three from 'three';
import { Posterise, ToolBar, type ToolHandle } from './common';

type FormSet = 'five' | 'egg-box' | 'stack';
type Source = 'lamp' | 'sun';

interface Controls {
  azimuth: number;
  elevation: number;
  source: Source;
  set: FormSet;
}

// A lamp moving around simple forms on a table, rendered in greys, so a drawing of light on form can
// be checked against what light actually does. Drag to look around; the sliders move the light.
// Everything here is generated, so the renders are ours to use as references.
export default function LightTool({ compact = false }: { compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const handle = useRef<ToolHandle<Controls> | null>(null);
  const [controls, setControls] = useState<Controls>({ azimuth: 315, elevation: 42, source: 'lamp', set: 'egg-box' });
  const [values, setValues] = useState(0);
  const [failed, setFailed] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        if (cancelled || !host.current) return;
        handle.current = buildScene(THREE, OrbitControls, host.current, controls);
      } catch (error) {
        setFailed((error as Error).message || '3D drawing is not available here.');
      }
    })();
    return () => { cancelled = true; handle.current?.dispose(); handle.current = null; };
    // The scene is built once; later changes go through handle.update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { handle.current?.update(controls); }, [controls]);

  const set = <K extends keyof Controls>(key: K, value: Controls[K]) => setControls((current) => ({ ...current, [key]: value }));

  return (
    <div className="tool">
      <Posterise />
      <div ref={host} className="tool-stage" data-values={values || undefined} aria-label="Simple forms lit by one light. Drag to look around." role="img">
        {failed ? <p className="viewer-message">{failed}</p> : null}
      </div>
      <ToolBar compact={compact}>
        <label>Light from
          <input type="range" min={0} max={359} value={controls.azimuth} onChange={(event) => set('azimuth', Number(event.target.value))} aria-valuetext={directionText(controls.azimuth)} />
          <span className="mono">{directionText(controls.azimuth)}</span>
        </label>
        <label>Height
          <input type="range" min={5} max={85} value={controls.elevation} onChange={(event) => set('elevation', Number(event.target.value))} />
          <span className="mono">{controls.elevation}°</span>
        </label>
        <label>Light
          <select value={controls.source} onChange={(event) => set('source', event.target.value as Source)}>
            <option value="lamp">Desk lamp</option>
            <option value="sun">Sunlight</option>
          </select>
        </label>
        <label>Forms
          <select value={controls.set} onChange={(event) => set('set', event.target.value as FormSet)}>
            <option value="egg-box">Egg and box</option>
            <option value="five">Five forms</option>
            <option value="stack">A stack</option>
          </select>
        </label>
        <label>Values
          <select value={values} onChange={(event) => setValues(Number(event.target.value))}>
            <option value={0}>All</option>
            <option value={2}>2, light and shadow</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>
      </ToolBar>
    </div>
  );
}

function directionText(azimuth: number): string {
  const names = ['front', 'front right', 'right', 'back right', 'behind', 'back left', 'left', 'front left'];
  return names[Math.round(((azimuth % 360) + 360) % 360 / 45) % 8]!;
}

type OrbitConstructor = typeof import('three/examples/jsm/controls/OrbitControls.js').OrbitControls;

function buildScene(THREE: typeof Three, OrbitControls: OrbitConstructor, host: HTMLElement, initial: Controls): ToolHandle<Controls> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x3b3b3b);
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0.4, 3.1, 7.4);
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.target.set(0, 0.7, 0);
  orbit.enableDamping = false;
  orbit.minDistance = 4;
  orbit.maxDistance = 14;
  orbit.maxPolarAngle = Math.PI / 2 - 0.05;
  orbit.update();

  const matte = new THREE.MeshStandardMaterial({ color: 0xdcdcdc, roughness: 0.82, metalness: 0 });
  const table = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0xa0a0a0, roughness: 1 }));
  table.rotation.x = -Math.PI / 2;
  table.receiveShadow = true;
  scene.add(table);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshStandardMaterial({ color: 0x8c8c8c, roughness: 1 }));
  wall.position.set(0, 10, -4);
  wall.receiveShadow = true;
  scene.add(wall);

  // Soft fill from the room, darker above than below, so the shadow side shows reflected light.
  const room = new THREE.HemisphereLight(0x8a8a8a, 0xa0a0a0, 0.9);
  scene.add(room);
  const sun = new THREE.DirectionalLight(0xffffff, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 30 });
  sun.shadow.radius = 2;
  const lamp = new THREE.SpotLight(0xffffff, 140, 0, Math.PI / 3.2, 0.85, 2);
  lamp.castShadow = true;
  lamp.shadow.mapSize.set(2048, 2048);
  lamp.shadow.radius = 3;
  lamp.target.position.set(0, 0.5, 0);
  scene.add(sun, lamp, lamp.target, sun.target);

  const forms = new THREE.Group();
  scene.add(forms);
  const add = (geometry: Three.BufferGeometry, x: number, y: number, z: number, rotation = 0, scaleY = 1) => {
    const mesh = new THREE.Mesh(geometry, matte);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotation;
    mesh.scale.y = scaleY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    forms.add(mesh);
  };
  const buildSet = (set: FormSet) => {
    for (const child of [...forms.children]) { forms.remove(child); (child as Three.Mesh).geometry.dispose(); }
    if (set === 'five') {
      add(new THREE.SphereGeometry(0.6, 64, 48), -2.5, 0.6, 0.2);
      add(new THREE.BoxGeometry(1, 1, 1), -1.15, 0.5, 0.8, 0.45);
      add(new THREE.CylinderGeometry(0.45, 0.45, 1.2, 64), 0.25, 0.6, -0.2);
      add(new THREE.ConeGeometry(0.55, 1.2, 64), 1.55, 0.6, 0.6);
      add(new THREE.SphereGeometry(0.5, 64, 48), 2.75, 0.64, -0.1, 0, 1.28);
    } else if (set === 'stack') {
      add(new THREE.BoxGeometry(1.4, 1, 1.4), -0.3, 0.5, 0, 0.35);
      add(new THREE.CylinderGeometry(0.42, 0.42, 1, 64), -0.3, 1.5, 0);
      add(new THREE.SphereGeometry(0.5, 64, 48), 1.2, 0.5, 0.9);
    } else {
      add(new THREE.SphereGeometry(0.55, 64, 48), -0.7, 0.7, 0.9, 0, 1.28);
      add(new THREE.BoxGeometry(1.3, 1.3, 1.3), 0.9, 0.65, -0.4, 0.55);
    }
  };

  const render = () => renderer.render(scene, camera);
  const resize = () => {
    const { clientWidth: width, clientHeight: height } = host;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  orbit.addEventListener('change', render);

  let current = '';
  const update = (controls: Controls) => {
    if (controls.set !== current) { buildSet(controls.set); current = controls.set; }
    const azimuth = (controls.azimuth * Math.PI) / 180;
    const elevation = (controls.elevation * Math.PI) / 180;
    const direction = new THREE.Vector3(Math.cos(elevation) * Math.sin(azimuth), Math.sin(elevation), Math.cos(elevation) * Math.cos(azimuth));
    sun.visible = controls.source === 'sun';
    lamp.visible = controls.source === 'lamp';
    sun.position.copy(direction.clone().multiplyScalar(12));
    lamp.position.copy(direction.clone().multiplyScalar(5.5)).add(new THREE.Vector3(0, 0.4, 0));
    render();
  };
  update(initial);
  resize();

  return {
    update,
    dispose: () => {
      observer.disconnect();
      orbit.dispose();
      for (const child of forms.children) (child as Three.Mesh).geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
