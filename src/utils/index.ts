import * as THREE from 'three';
import {Mesh, Vector3} from 'three';

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

export function setOpacity(mesh: Mesh, opacity: number) {
  const material = mesh.material;
  if (material) {
    if (Array.isArray(material)) {
      for (const i of material) {
        i.opacity = opacity;
      }
    } else {
      material.opacity = opacity;
    }
  }

  if (mesh.children) {
    for (const i of mesh.children) {
      setOpacity(i as Mesh, opacity);
    }
  }
}

// Returns the index of the absolute maximum
export function absMaxIndex(arr: number[]) {
  const len = arr.length;
  if (!len) {
    return null;
  }

  let maxValue = Math.abs(arr[0]);
  let maxIndex = 0;
  for (let i = 1; i < len; i++) {
    const value = Math.abs(arr[i]);
    if (value > maxValue) {
      maxValue = value;
      maxIndex = i;
    }
  }
  return maxIndex;
}

type Axis = 'x' | 'y' | 'z';

// Returns the closest axis
export function getClosestAxis(vec: Vector3): Axis {
  let maxAxis;
  let maxValue;
  for (const [axis, value] of Object.entries(vec)) {
    const absValue = Math.abs(value);
    if (!maxValue || absValue > maxValue) {
      maxAxis = axis;
      maxValue = absValue;
    }
  }
  return maxAxis as Axis;
}

export function err(strs: TemplateStringsArray, ...args: any[]) {
  let result = '';
  strs.forEach((str, i) => {
    let arg = args[i];
    if (typeof arg === 'object') {
      arg = JSON.stringify(arg);
    } else if (arg === undefined) {
      arg = '';
    }

    result += str + arg;
  });
  return result;
}
