
import * as THREE from 'three';

export function roundedEdgeBox(width = 1, height = 1, depth = 1, radius0 = 0.1, smoothness = 4) {
  // Reference: https://discourse.threejs.org/t/round-edged-box/1402
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
export function roundedPlane(x = 0, y = 0, width = 0.9, height = 0.9, radius = 0.1) {
  // Reference: https://threejs.org/examples/webgl_geometry_shapes.html
  const shape = new THREE.Shape();
  const center = new THREE.Vector2(-(x + width / 2), -(y + height / 2));
  shape.moveTo(center.x, center.y + radius);
  shape.lineTo(center.x, center.y + height - radius);
  shape.quadraticCurveTo(center.x, center.y + height, center.x + radius, center.y + height);
  shape.lineTo(center.x + width - radius, center.y + height);
  shape.quadraticCurveTo(center.x + width, center.y + height, center.x + width, center.y + height - radius);
  shape.lineTo(center.x + width, center.y + radius);
  shape.quadraticCurveTo(center.x + width, center.y, center.x + width - radius, center.y);
  shape.lineTo(center.x + radius, center.y);
  shape.quadraticCurveTo(center.x, center.y, center.x, center.y + radius);
  const geometry = new THREE.ShapeBufferGeometry(shape);
  return geometry;
}

