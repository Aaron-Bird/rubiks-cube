import * as THREE from 'three';

export function debounce(func: Function, delay = 200) {
  let timer: number;
  return function(...args: any[]) {
    if (timer) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(()=> {
      func(args);
    }, delay);
  };
}

// Get rotation angle relative to the origin (ignore the y-axis)
export function horizontalRotationAngle(position: THREE.Vector3) {
  const dir = new THREE.Vector3();
  dir.subVectors(position, new THREE.Vector3(0, position.y, 0)).normalize();
  const rad = new THREE.Vector2(dir.z, dir.x).angle();
  return rad;
}
