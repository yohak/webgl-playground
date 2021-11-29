import * as THREE from "three";

export const fillAttribute = (
  attr: THREE.Float32BufferAttribute,
  count: number
): THREE.Float32BufferAttribute => {
  const positions: Float32Array = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i] = attr.array[i] || 0;
  }
  return new THREE.Float32BufferAttribute(positions, 3);
};

const getPointFromBuffer = (index: number, buffer: THREE.Float32BufferAttribute): THREE.Vector3 => {
  // console.log(index, buffer.getX(index), buffer);
  return new THREE.Vector3(buffer.getX(index), buffer.getY(index), buffer.getZ(index));
};

export const getPointsOfFace = (
  face: THREE.Face,
  points: THREE.Float32BufferAttribute
): THREE.Vector3[] => {
  return [
    getPointFromBuffer(face.a, points),
    getPointFromBuffer(face.b, points),
    getPointFromBuffer(face.c, points),
  ];
};
