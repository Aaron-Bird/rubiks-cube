import * as THREE from 'three';
import {Mesh} from 'three';
import {RubikCube, Cubelet} from './rubik-cube';
import {Vector2} from 'three';

class Geometry {
  static roundedEdgeBox(width = 1, height = 1, depth = 1, radius0 = 0.1, smoothness = 4) {
    // reference: https://discourse.threejs.org/t/round-edged-box/1402
    const shape = new THREE.Shape();
    const eps = 0.00001;
    const radius = radius0 - eps;
    shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
    shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
    shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
    shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
    const geometry = new THREE.ExtrudeBufferGeometry(shape, {
      depth: depth - radius0 * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius0,
      curveSegments: smoothness,
    });
    geometry.center();
    return geometry;
  }
  static roundedPlane(x = 0, y = 0, width = 0.9, height = 0.9, radius = 0.1) {
    // refer: https://threejs.org/examples/webgl_geometry_shapes.html
    const shape = new THREE.Shape();
    const center = new Vector2(-(x + width / 2), -(y + height / 2));
    shape.moveTo(center.x, center.y + radius);
    shape.lineTo(center.x, center.y + height - radius);
    shape.quadraticCurveTo(center.x, center.y + height, center.x + radius, center.y + height);
    shape.lineTo(center.x + width - radius, center.y + height);
    shape.quadraticCurveTo(center.x + width, center.y + height, center.x + width, center.y + height - radius);
    shape.lineTo(center.x + width, center.y + radius);
    shape.quadraticCurveTo(center.x + width, center.y, center.x + width - radius, center.y);
    shape.lineTo(center.x + radius, center.y);
    shape.quadraticCurveTo(center.x, center.y, center.x, center.y + radius);
    // return shape;
    const geometry = new THREE.ShapeBufferGeometry(shape);
    return geometry;
  }
}

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

export interface CubeletModel extends Mesh {
  cubeType: string;
}

export class RubikCubeModel extends RubikCube {
  model = new THREE.Group();
  constructor(fb: string) {
    super(fb);
    for (const cubeInfo of this.cubelets) {
      const cubeletModel = this.generateCubeletModel(cubeInfo) as CubeletModel;
      cubeletModel.name = 'cubelet';
      cubeletModel.cubeType = cubeInfo.type;
      cubeletModel.position.set(cubeInfo.x, cubeInfo.y, cubeInfo.z);
      this.model.add(cubeletModel);
    }
  }

  generateCubeletModel(info: Cubelet) {
    const geometry = Geometry.roundedEdgeBox(1, 1, 1, 0.05, 4);
    const materials =new THREE.MeshLambertMaterial({emissive: '#EEE', transparent: true});
    const cubeletModel = new THREE.Mesh(geometry, materials);
    const color = info.color;
    for (const key of Object.keys(color)) {
      const planeGeometry = Geometry.roundedPlane(0, 0, 0.9, 0.9, 0.1);
      const planeMaterial = new THREE.MeshLambertMaterial({emissive: color[key], transparent: true});
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.set(...faceInfo[key].rotation);
      plane.position.set(...faceInfo[key].position);
      plane.name = 'face';
      cubeletModel.attach(plane);
    }
    return cubeletModel;
  }
}
