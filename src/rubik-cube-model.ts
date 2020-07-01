import * as THREE from 'three';
import {RubikCube, Cubelet} from './rubik-cube';
import {roundedEdgeBox, roundedPlane} from './geometries';

const faceInfo: {
  [index: string]: {
    position: [number, number, number],
    rotation: [number, number, number]
  }
} = {
  U: {position: [0, 0.51, 0], rotation: [-Math.PI /2, 0, 0]},
  D: {position: [0, -0.51, 0], rotation: [Math.PI /2, 0, 0]},
  F: {position: [0, 0, 0.51], rotation: [0, 0, 0]},
  B: {position: [0, 0, -0.51], rotation: [Math.PI, 0, 0]},
  L: {position: [-0.51, 0, 0], rotation: [0, -Math.PI /2, 0]},
  R: {position: [0.51, 0, 0], rotation: [0, Math.PI /2, 0]},
};

export interface CubeletModel extends THREE.Mesh {
  cubeType?: string;
  num?: number;
  initPosition?: THREE.Vector3;
}

export class RubikCubeModel extends RubikCube {
  model = new THREE.Group();
  constructor(fb?: string) {
    super(fb);
    for (const cubeInfo of this.cubelets) {
      const cubeletModel = this.generateCubeletModel(cubeInfo);
      cubeletModel.name = 'cubelet';
      cubeletModel.cubeType = cubeInfo.type;
      cubeletModel.num = cubeInfo.num;
      cubeletModel.position.set(cubeInfo.x, cubeInfo.y, cubeInfo.z);
      cubeletModel.initPosition = new THREE.Vector3().set(cubeInfo.x, cubeInfo.y, cubeInfo.z);
      this.model.add(cubeletModel);
    }
  }

  generateCubeletModel(info: Cubelet) {
    const geometry = roundedEdgeBox(1, 1, 1, 0.05, 4);
    const materials =new THREE.MeshLambertMaterial({emissive: '#333', transparent: true});
    const cubeletModel = new THREE.Mesh(geometry, materials) as CubeletModel;
    const color = info.color;
    for (const key of Object.keys(color)) {
      const planeGeometry = roundedPlane(0, 0, 0.9, 0.9, 0.1);
      const planeMaterial = new THREE.MeshLambertMaterial({emissive: color[key], transparent: true});
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.fromArray(faceInfo[key].rotation);
      plane.position.fromArray(faceInfo[key].position);
      plane.name = 'face';
      cubeletModel.attach(plane);
    }
    return cubeletModel;
  }

  dispose() {
    for (const cubeletModel of (this.model.children as CubeletModel[])) {
      if (cubeletModel.material instanceof THREE.Material) {
        cubeletModel.material.dispose();
      }
      cubeletModel.geometry.dispose();
      for (const plan of (cubeletModel.children as THREE.Mesh[])) {
        if (plan.material instanceof THREE.Material) {
          plan.material.dispose();
        }
        (plan as THREE.Mesh).geometry.dispose();
      }
    }
  }
}
