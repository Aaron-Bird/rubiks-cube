import * as THREE from 'three';
import {setOpacity} from './utils';
import TWEEN from '@tweenjs/tween.js';
import {Axis, AxisValue} from './types';

export class LayerModel extends THREE.Group {
  debug: boolean = false;
  constructor(debug?: boolean) {
    super();
    if (debug) {
      this.debug = true;
    }
  }
  group(axis: Axis, value: AxisValue, cubelets: THREE.Object3D[]) {
    // Each Object3d can only have one parent.
    // Object3d will be removed from cubeletModels when it is added to layerGroup.
    // for (let i = 0; i < cubeletModels.length; i++) {
    for (let i = cubelets.length - 1; i >= 0; i--) {
      if (cubelets[i].position[axis] === value) {
        if (this.debug) {
          setOpacity(cubelets[i] as THREE.Mesh, 0.5);
        }
        this.add(cubelets[i]);
      }
    }
  }

  ungroup(target: THREE.Object3D) {
    if (!this.children.length) {
      return;
    }
    // Updates the global transform If you need to get rotation immediately when rotation Object3d
    this.updateWorldMatrix(false, false);

    for (let i = this.children.length - 1; i >= 0; i--) {
      const obj = this.children[i];

      const position = new THREE.Vector3();
      obj.getWorldPosition(position);

      const quaternion = new THREE.Quaternion();
      obj.getWorldQuaternion(quaternion);

      this.remove(obj);

      position.x = parseFloat((position.x).toFixed(15));
      position.y = parseFloat((position.y).toFixed(15));
      position.z = parseFloat((position.z).toFixed(15));

      if (this.debug) {
        setOpacity(obj as THREE.Mesh, 1);
      }
      obj.position.copy(position);
      obj.quaternion.copy(quaternion);

      target.add(obj);
    }
  }

  initRotation() {
    this.rotation.x = 0;
    this.rotation.y = 0;
    this.rotation.z = 0;
  }

  async rotationAnimation(axis: Axis, endRad: number) {
    if (!['x', 'y', 'z'].includes(axis)) {
      throw new Error(`Wrong axis: ${axis}`);
    }

    // The rotation degree may be greater than 360
    // Like: 361 -> 0
    const startRad = this.rotation[axis] % (Math.PI * 2);
    if (startRad === endRad) {
      return;
    }

    const current = {rad: startRad};
    const end = {rad: endRad};
    const time = Math.abs(endRad - startRad) * (500 / Math.PI);

    return new Promise((resolve, reject) => {
      try {
        new TWEEN.Tween(current)
            .to(end, time)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
              this.rotation[axis] = current.rad;
              // Updates the global transform If you need to get rotation immediately
              // this.updateWorldMatrix(false, false);
            })
            .onComplete(resolve)
        // Parameter 'undefined' is needed in version 18.6.0
        // Reference: https://github.com/tweenjs/tween.js/pull/550
            .start(undefined);
      } catch (err) {
        reject(err);
      }
    });
  }
}
