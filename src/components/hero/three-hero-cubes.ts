import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type HeroCube = {
  mesh: THREE.Mesh;
  g: THREE.Vector3;
  q: THREE.Quaternion;
  dir: THREE.Vector3;
};

export const CUBE_AXES = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
];

export const CUBE_EXPLODE = 5.0;
export const CUBE_GAP = 0.92;
export const CUBE_TWIST_DUR = 0.9;

export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export function createCubeCluster(material: THREE.Material, width: number, height: number) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
  camera.position.set(0, 0, 6);

  const group = new THREE.Group();
  const geometry = new RoundedBoxGeometry(0.84, 0.84, 0.84, 5, 0.17);
  const cubes: HeroCube[] = [];
  let dirPick = 0;

  for (let gx = -1; gx <= 1; gx++) {
    for (let gy = -1; gy <= 1; gy++) {
      for (let gz = -1; gz <= 1; gz++) {
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        const candidates: THREE.Vector3[] = [];
        if (gx !== 0) candidates.push(new THREE.Vector3(Math.sign(gx), 0, 0));
        if (gy !== 0) candidates.push(new THREE.Vector3(0, Math.sign(gy), 0));
        if (gz !== 0) candidates.push(new THREE.Vector3(0, 0, Math.sign(gz)));
        const dir = candidates.length ? candidates[dirPick++ % candidates.length] : new THREE.Vector3();

        cubes.push({
          mesh,
          g: new THREE.Vector3(gx, gy, gz),
          q: new THREE.Quaternion(),
          dir,
        });
      }
    }
  }

  scene.add(group);

  const place = (nextWidth: number, nextHeight: number) => {
    camera.aspect = nextWidth / nextHeight;
    camera.updateProjectionMatrix();
    const vFOV = (camera.fov * Math.PI) / 180;
    const visH = 2 * Math.tan(vFOV / 2) * camera.position.z;
    const visW = visH * (nextWidth / nextHeight);
    group.position.set((0.73 - 0.5) * visW, (0.5 - 0.46) * visH, 0);
    group.scale.setScalar((Math.min(visH, visW) * 0.36) / 3.0);
  };

  place(width, height);

  return { scene, camera, group, cubes, geometry, place };
}
