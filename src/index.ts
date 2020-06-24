import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import TWEEN from '@tweenjs/tween.js';

import {debounce, horizontalRotationAngle, setOpacity, getClosestAxis} from './utils';
import {RubikCubeModel} from './rubik-cube-model';


const minMoveDistance = 10;
const rotationRadPerPx = 0.01;
const debug = false;

const raycaster = new THREE.Raycaster();
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
const screenCenterCoords = new THREE.Vector2(screenWidth / 2, screenHeight / 2);

let draggable = true;
let mouseTarget: THREE.Intersection;
let mouseMoveAxis: 'x' | 'y';
let initMoveToward: number;
const mouseTargetFaceDirection = new THREE.Vector3(); // Vector3
const mouseCoords = new THREE.Vector2();
const mousedownCoords = new THREE.Vector2();

type Notation =[string, number];
const notationTable: {x: Notation[], y: Notation[], z: Notation[]} = {
  x: [['L', 1], ['M', 1], ['R', -1]], // M: horizontal, left right
  y: [['D', 1], ['E', 1], ['U', -1]], // E: vertical, front back
  z: [['B', 1], ['S', -1], ['F', -1]], // S: horizontal, front back
};

const layerGroup = new THREE.Group();
let layerRotationNotation: Notation;
let layerRorationAxis: 'x' | 'y' | 'z';
let layerRotationAxisToward: 1 | -1 = 1;
let lockRotationDirection = false;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#F1F3F3');
// scene.background = new THREE.TextureLoader().load(require('./img/background.jpg').default);

const directionalLight = new THREE.DirectionalLight('#FFF', 0.05);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight('#FFF', 0.05);
directionalLight2.position.set(-10, -10, -10);
scene.add(directionalLight2);

// const ambientLight = new THREE.AmbientLight('#FFF');
// scene.add(ambientLight);

const camera = new THREE.PerspectiveCamera(75, screenWidth / screenHeight, 0.1, 30);
if (screenWidth < 576) {
  camera.position.set(4, 4, 4);
} else {
  camera.position.set(3.5, 3, 3.5);
}

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(screenWidth, screenHeight);
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableDamping = true;
controls.rotateSpeed = 1.5;
controls.minDistance = debug ? 1 : 3;
controls.maxDistance = debug ? 20 : 10;

const URLSearchStr = window.location.search;
const searchParam = new URLSearchParams(URLSearchStr.slice(1));
const fd = searchParam.get('fd');

const rubikCube = new RubikCubeModel(fd);
const cubeletModels = rubikCube.model.children;
scene.add(rubikCube.model);
scene.add(layerGroup);

window.addEventListener('resize', debounce(function() {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  screenCenterCoords.set(screenWidth / 2, screenHeight / 2);

  camera.aspect = screenWidth / screenHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(screenWidth, screenHeight);
}));

renderer.domElement.addEventListener('mousedown', function() {
  handleMouseDown();
});

renderer.domElement.addEventListener('touchstart', function(e) {
  const touch = e.changedTouches[0];
  mouseCoords.set(touch.clientX, touch.clientY);
  handleMouseDown();
});

renderer.domElement.addEventListener('mouseup', function() {
  handleMouseUp();
});

renderer.domElement.addEventListener('touchend', function() {
  handleMouseUp();
});

renderer.domElement.addEventListener('mousemove', function(e) {
  mouseCoords.set(e.clientX, e.clientY);
  handleMouseMove();
});

renderer.domElement.addEventListener('touchmove', function(e) {
  const touch = e.changedTouches[0];
  mouseCoords.set(touch.clientX, touch.clientY);
  handleMouseMove();
});

// todo
// random solve cube
document.querySelector('#resolve-btn').addEventListener('click', function() {
});

function animate(time?: number) {
  requestAnimationFrame(animate);
  if (controls) {
    controls.update();
  }
  TWEEN.update(time);
  renderer.render(scene, camera);
};
animate();


function handleMouseUp() {
  if (debug && mouseTarget) {
    const cubeletModel = mouseTarget.object;
    setOpacity(cubeletModel as THREE.Mesh, 1);
  }

  lockRotationDirection = false;
  mouseTarget = null;
  layerRotationAxisToward = 1;
  initMoveToward = null;

  // current rotation deg
  const deg = Math.abs((THREE as any).Math.radToDeg(layerGroup.rotation[layerRorationAxis])) % 360;
  const sign = Math.sign(layerGroup.rotation[layerRorationAxis]);

  let endDeg;
  if (0 <= deg && deg <= 45) {
    endDeg = 0;
  } else if (45 < deg && deg <= 135) {
    endDeg = 90;
  } else if (135 < deg && deg <= 225) {
    endDeg = 180;
  } else if (225 < deg && deg <= 315) {
    endDeg = 270;
  } else if (315 < deg && deg <= 360) {
    endDeg = 360;
  }

  // Use url search params to record cube colors
  if (endDeg > 0 && layerRotationNotation) {
    let toward = layerRotationNotation[1];
    if (sign < 0) {
      toward *= -1;
    }
    let baseStr = layerRotationNotation[0];
    if (toward< 0) {
      baseStr += `'`;
    }
    baseStr += ' ';

    let moveStr = '';
    for (let i = 0; i < Math.floor(endDeg / 90); i++) {
      moveStr += baseStr;
    }
    // Update URL
    rubikCube.move(moveStr);
    searchParam.set('fd', rubikCube.asString());
    window.history.replaceState('', '', '?' + searchParam.toString());
  }

  // Transition animation
  // Move the rotation angle to a multiple of 90 or 0

  // Don't put controls.enabled in Tween.onComplete
  controls.enabled = true;
  if (typeof endDeg === 'number') {
    draggable = false;

    const currentRotation = {deg: deg * sign};
    const targetRotation = {deg: endDeg * sign};

    const time = Math.abs(endDeg - deg) * (10 / Math.PI);
    new TWEEN.Tween(currentRotation)
        .to(targetRotation, time)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
          layerGroup.rotation[layerRorationAxis] = (THREE as any).Math.degToRad(currentRotation.deg);
          layerGroup.updateWorldMatrix(false, false);
        })
        .onComplete(onEnd)
        // Parameter 'undefined' is needed in version 18.6.0
        // Reference: https://github.com/tweenjs/tween.js/pull/550
        .start(undefined);
  } else {
    onEnd();
  }

  function onEnd() {
    // Dissolve the cube layer
    if (layerGroup.children) {
      for (let i = layerGroup.children.length - 1; i >= 0; i--) {
        const cubeletModel = layerGroup.children[i];
        const position = new THREE.Vector3();
        cubeletModel.getWorldPosition(position);
        const quaternion = new THREE.Quaternion();
        cubeletModel.getWorldQuaternion(quaternion);
        layerGroup.remove(cubeletModel);
        position.x = parseFloat((position.x).toFixed(15));
        position.y = parseFloat((position.y).toFixed(15));
        position.z = parseFloat((position.z).toFixed(15));
        if (debug) {
          setOpacity(cubeletModel as THREE.Mesh, 1);
        }

        cubeletModel.position.copy(position);
        cubeletModel.quaternion.copy(quaternion);

        rubikCube.model.add(cubeletModel);
      }

      layerGroup.rotation.x = 0;
      layerGroup.rotation.y = 0;
      layerGroup.rotation.z = 0;
    }

    layerRorationAxis = null;
    layerRotationNotation = null;
    draggable = true;
    mouseMoveAxis = null;
  }
}

function handleMouseDown() {
  const x = (mouseCoords.x/ screenWidth) * 2 - 1;
  const y = -(mouseCoords.y/ screenHeight) * 2 + 1;
  raycaster.setFromCamera({x, y}, camera);
  const intersects = raycaster.intersectObjects(rubikCube.model.children);

  if (intersects.length) {
    // Show hand when the mouse is over the cube
    document.body.classList.add('cursor-pointer');
    mousedownCoords.copy(mouseCoords);

    mouseTarget = intersects[0];
    if (debug) {
      const cubeletModel = mouseTarget.object as THREE.Mesh;
      setOpacity(cubeletModel, 0.5);
    }

    controls.enabled = false;
  }
}

function handleMouseMove() {
  const x = (mouseCoords.x/ screenWidth) * 2 - 1;
  const y = -(mouseCoords.y/ screenHeight) * 2 + 1;

  raycaster.setFromCamera({x, y}, camera);
  const intersects = raycaster.intersectObjects(rubikCube.model.children);
  if (intersects.length) {
    document.body.classList.add('cursor-pointer');
  } else {
    document.body.classList.remove('cursor-pointer');
  }

  if (!mouseTarget || !draggable) {
    return;
  }

  if (!lockRotationDirection) {
    const mouseMoveDistance = mousedownCoords.distanceTo(mouseCoords);
    if (Math.abs(mouseMoveDistance) < minMoveDistance) {
      return;
    }

    lockRotationDirection = true;

    const direction = new THREE.Vector2();
    direction.subVectors(mouseCoords, mousedownCoords).normalize();
    mouseMoveAxis = Math.abs(direction.x) > Math.abs(direction.y) ? 'x' : 'y';

    mouseTargetFaceDirection.copy(mouseTarget.face.normal);
    mouseTargetFaceDirection.transformDirection(mouseTarget.object.matrixWorld);

    const point = mouseTarget.point;
    const mouseDirection = new THREE.Vector3().subVectors(point, new THREE.Vector3(0, 0, 0)).normalize();
    // Don't use mouseTargetFaceDirection
    // The rounded corners of the box may face the other way.
    // const closestAxis = getClosestAxis(mouseTargetFaceDirection);
    const closestAxis = getClosestAxis(mouseDirection);
    const axisValue = mouseDirection[closestAxis];
    mouseTargetFaceDirection.set(0, 0, 0);
    mouseTargetFaceDirection[closestAxis] = Math.sign(axisValue);

    // Get the rotation axis according to the direction of mouse movement and target face normal
    if (mouseTargetFaceDirection.y > 0.9) { // Top  face
      const rad = horizontalRotationAngle(camera.position);
      direction.rotateAround(new THREE.Vector2(0, 0), rad * -1);
      mouseMoveAxis = Math.abs(direction.x) > Math.abs(direction.y) ? 'x' : 'y';

      if (mouseMoveAxis === 'y') {
        layerRorationAxis = 'x';
      } else if (mouseMoveAxis === 'x') {
        layerRorationAxis = 'z';
        layerRotationAxisToward = -1;
      }
    } else if (mouseTargetFaceDirection.y < -0.9) { // Down face
      const rad = horizontalRotationAngle(camera.position);
      direction.rotateAround(new THREE.Vector2(0, 0), rad * 1);
      mouseMoveAxis = Math.abs(direction.x) > Math.abs(direction.y) ? 'x' : 'y';

      if (mouseMoveAxis === 'y') {
        layerRorationAxis = 'x';
      } else if (mouseMoveAxis === 'x') {
        layerRorationAxis = 'z';
      }
    } else if (mouseTargetFaceDirection.x < -0.9) { // Left  face
      if (mouseMoveAxis === 'y') {
        layerRorationAxis = 'z';
      } else if (mouseMoveAxis === 'x') {
        layerRorationAxis = 'y';
      }
    } else if (mouseTargetFaceDirection.x > 0.9) { // Right face
      if (mouseMoveAxis === 'y') {
        layerRorationAxis = 'z';
        layerRotationAxisToward = -1;
      } else if (mouseMoveAxis === 'x') {
        layerRorationAxis = 'y';
      }
    } else if (mouseTargetFaceDirection.z > 0.9) { // Front face
      if (mouseMoveAxis === 'y') { // Vertical movement
        layerRorationAxis = 'x';
      } else if (mouseMoveAxis === 'x') { // Horizontal movement
        layerRorationAxis = 'y';
      }
    } else if (mouseTargetFaceDirection.z < -0.9) { // Back face
      if (mouseMoveAxis === 'y') {
        layerRorationAxis = 'x';
        layerRotationAxisToward = -1;
      } else if (mouseMoveAxis === 'x') {
        layerRorationAxis = 'y';
      }
    } else {
      throw new Error(`Wrong mouseTargetFaceDirection: ${mouseTargetFaceDirection}`);
    }

    // Get Singmaster notation according the rotation axis and mouse movement direction
    const position = mouseTarget.object.position;
    // -1 0 1 -> 0 1 2
    const index = position[layerRorationAxis] + 1;
    layerRotationNotation = notationTable[layerRorationAxis][index];

    // Package cubelet to layer

    // Each Object3d can only have one parent.
    // Object3d will be removed from cubeletModels when it is added to layerGroup.
    // for (let i = 0; i < cubeletModels.length; i++) {
    for (let i = cubeletModels.length - 1; i >= 0; i--) {
      if (cubeletModels[i].position[layerRorationAxis] === mouseTarget.object.position[layerRorationAxis]) {
        if (debug) {
          setOpacity(cubeletModels[i] as THREE.Mesh, 0.5);
        }

        layerGroup.add(cubeletModels[i]);
      }
    }
  } else {
    let mouseMoveDistance = mouseCoords[mouseMoveAxis] - mousedownCoords[mouseMoveAxis];
    // Get the moving distance by the camera rotation angle relative to origin when clicking on the top face and down face
    if (mouseTargetFaceDirection && Math.abs(mouseTargetFaceDirection.y) > 0.9) {
      const yAxisDirection = Math.sign(mouseTargetFaceDirection.y) * -1;
      const dir = new THREE.Vector3();
      dir.subVectors(camera.position, new THREE.Vector3(0, camera.position.y, 0)).normalize();
      const rad = new THREE.Vector2(dir.z, dir.x).angle();
      const mouseCurrentRotation = new THREE.Vector2().copy(mouseCoords);
      mouseCurrentRotation.rotateAround(screenCenterCoords, rad * yAxisDirection);
      const mouseDownRotation = new THREE.Vector2().copy(mousedownCoords);
      mouseDownRotation.rotateAround(screenCenterCoords, rad * yAxisDirection);

      mouseMoveDistance = mouseCurrentRotation[mouseMoveAxis] - mouseDownRotation[mouseMoveAxis];
    }

    if (!initMoveToward) {
      initMoveToward = Math.sign(mouseMoveDistance);
    }

    if (layerGroup && layerRorationAxis) {
      layerGroup.rotation[layerRorationAxis] =
        (mouseMoveDistance - minMoveDistance * initMoveToward) * rotationRadPerPx * layerRotationAxisToward;
    }
  }
}

