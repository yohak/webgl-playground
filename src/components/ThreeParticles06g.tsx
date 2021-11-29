import { css } from "@emotion/react";
import BezierEasing from "bezier-easing";
import React, { FC, useEffect, useRef } from "react";
import SimplexNoise from "simplex-noise";
import * as THREE from "three";
import { LineBasicMaterial } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { TexturePass } from "three/examples/jsm/postprocessing/TexturePass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";
import { Ease24, Tween24 } from "tween24";
import { rangeMap } from "yohak-tools";
import { degreeToRadian, radianToDegree } from "yohak-tools/dist/geom/angles";
import { valueBetween } from "yohak-tools/dist/geom/value-between";
import frag from "../shader/three06e.frag";
import vert from "../shader/three06e.vert";
import { perlin4D } from "../utils/perlin";

export type ThreeParticles06gProps = {};

export const ThreeParticles06g: FC<ThreeParticles06gProps> = ({}) => {
  const wrapperRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    console.log("init");
    const destroy = init(wrapperRef.current);
    return () => {
      console.log("unmount");
      destroy();
    };
  }, []);
  return <canvas ref={wrapperRef} css={bg} />;
};

const bg = css`
  background-image: url("/assets/noise.png"), linear-gradient(109deg, #6464d2, #ed3b64);
  background-size: auto, 400% 400%;
  animation: AnimationName 20s ease infinite;
  @keyframes AnimationName {
    0% {
      background-position: 0 0, 92% 0%;
    }
    50% {
      background-position: 0 0, 9% 100%;
    }
    100% {
      background-position: 0 0, 92% 0%;
    }
  }
`;

const RAYCAST_DISTANCE = 0.1;
const easing = BezierEasing(0.5, 0, 0.8, 1);
const init = (canvas: HTMLCanvasElement): (() => void) => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const fov = 75;
  const near = 10;
  const far = 10000;
  const aspect = 1;
  //
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.clear();
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.aspect = canvas.width / canvas.height;
  camera.updateProjectionMatrix();
  const scene = new THREE.Scene();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  raycaster.params.Points.threshold = RAYCAST_DISTANCE;
  //
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  renderPass.clear = false;
  const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
  const bloomPass = new UnrealBloomPass(resolution, 0, 0.5, 0.7);
  const texturePass = new TexturePass(null, 1);
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("/assets/background.jpg", function (map) {
    texturePass.map = map;
  });
  const copyPass = new ShaderPass(CopyShader);

  // composer.addPass(texturePass);
  // composer.addPass(renderPass);
  // composer.addPass(copyPass);
  // composer.addPass(bloomPass);
  //
  const onResizeWindow = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener("resize", onResizeWindow);
  //
  const objGroup: THREE.Group = new THREE.Group();
  scene.add(objGroup);
  camera.position.z = 200;
  camera.position.y = 40;
  camera.lookAt(objGroup.position);
  //
  let cursorX = 0;
  let cursorY = 0;
  let targetRotationY = 0;
  let targetRotationX = 0;
  const onMouseMove = (e: MouseEvent) => {
    cursorX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    cursorY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    targetRotationY = rangeMap([-1, 1], [15, -15], cursorX);
    targetRotationX = rangeMap([-1, 1], [10, -10], cursorY);
    //
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  };
  document.addEventListener("mousemove", onMouseMove);

  const onMouseLeaveFromWindow = () => {
    targetRotationY = 0;
    targetRotationX = 0;
  };
  document.addEventListener("mouseout", onMouseLeaveFromWindow);

  //

  const paths: string[] = ["/assets/heart2.obj", "/assets/woman2.obj"];
  let particleGeom: THREE.BufferGeometry;
  let particles: THREE.Points;
  let loadCount = 0;
  let shapeIndex: number = 0;
  let isMorphing: boolean = false;
  let time = 0;
  let verticesCount = 0;
  let guide: THREE.Mesh;
  const particleMat = new THREE.ShaderMaterial({
    fragmentShader: frag,
    vertexShader: vert,
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0xff00ff) },
      point: { value: new THREE.Vector3() },
    },
    transparent: true,
    // depthTest: false,
  });
  const onLoadItem = () => {
    loadCount++;
    if (loadCount < paths.length) return;
    //
    const maxPositions = Math.max(...shapes.map((r) => r.getVertices().length));
    verticesCount = Math.max(...shapes.map((r) => r.getVertices().length));
    shapes.forEach((shape) => shape.fillVertices(maxPositions));
    particleGeom = new THREE.BufferGeometry();
    const positions: number[] = [];
    particleGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    // const particleMat = new THREE.PointsMaterial();

    particles = new THREE.Points(particleGeom, particleMat);
    console.log(particles);
    objGroup.add(particles);
    //
    showItem(0);
    particleGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(shapes[0].getVertices(), 3)
    );
  };
  const shapes: ShapeVertices[] = paths.map((p, i) => new ShapeVertices(p, i, onLoadItem));
  const lineOpacity = 0.2;

  const showItem = (index: number) => {
    const wire = shapes[index].getItem();
    guide = shapes[index].getGuide();
    objGroup.add(guide);
    const prop = { opacity: 0 };
    const tween = Tween24.tween(prop, 1, Ease24._4_QuartOut, { opacity: lineOpacity, scale: 1 });
    tween.onUpdate(() => {
      (wire.material as LineBasicMaterial).opacity = prop.opacity;
    });
    objGroup.add(wire);
    tween.play();
  };
  const hideItem = (index: number) => {
    objGroup.remove(guide);
    const wire = shapes[index].getItem();
    const prop = { opacity: lineOpacity };
    const tween = Tween24.tween(prop, 0.7, Ease24._4_QuartOut, { opacity: 0 });
    tween.onUpdate(() => {
      (wire.material as LineBasicMaterial).opacity = prop.opacity;
    });
    tween.onComplete(() => {
      objGroup.remove(wire);
    });
    tween.play();
  };
  const morphParticles = (targetPositions: number[]) => {
    const originalPositions = particleGeom.getAttribute("position").array;
    let newPositions: number[];
    const obj = { percent: 0 };
    const tween = Tween24.tween(obj, 1, Ease24._4_QuartInOut, { percent: 1 });
    tween.onUpdate(() => {
      newPositions = targetPositions.map((v, i) =>
        valueBetween(originalPositions[i], v, obj.percent)
      );
      particleGeom.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
    });
    tween.onComplete(() => (isMorphing = false));
    tween.play();
  };
  const onClickCanvas = () => {
    if (isMorphing) return;
    //
    isMorphing = true;
    const nextIndex = (shapeIndex + 1) % shapes.length;
    const morphTarget = shapes[nextIndex].getVertices();
    Tween24.serial(
      Tween24.func(() => hideItem(shapeIndex)),
      Tween24.func(() => morphParticles(morphTarget)),
      Tween24.func(() => showItem(nextIndex)).delay(0.7),
      Tween24.func(() => {
        isMorphing = false;
        shapeIndex = nextIndex;
      })
    ).play();
  };
  canvas.addEventListener("click", onClickCanvas);
  //
  let animationRequest: number;
  const render = () => {
    time += 0.05;
    if (!isMorphing && particles) {
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects([guide], false);
      const updated = shapes[shapeIndex].update(time, intersections);
      const newPositions = fillArray(updated, 0, verticesCount);
      particleGeom.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
    }
    if (objGroup) {
      const rotationY = radianToDegree(objGroup.rotation.y);
      const rotationX = radianToDegree(objGroup.rotation.x);
      objGroup.rotation.y = degreeToRadian(rotationY + (targetRotationY - rotationY) / 50);
      objGroup.rotation.x = degreeToRadian(rotationX + (targetRotationX - rotationX) / 50);
    }
    // composer.render();
    renderer.render(scene, camera);
    animationRequest = requestAnimationFrame(render);
  };
  animationRequest = requestAnimationFrame(render);

  //
  return () => {
    renderer.dispose();
    window.removeEventListener("resize", onResizeWindow);
    document.removeEventListener("mouseout", onMouseLeaveFromWindow);
    canvas.removeEventListener("mouseleave", onMouseMove);
    canvas.removeEventListener("click", onClickCanvas);
    cancelAnimationFrame(animationRequest);
    console.log("destroy");
  };
};

const fillArray = <T extends any>(arr: T[], value: T, count: number): T[] => {
  const result = [...arr];
  while (result.length <= count) {
    result.push(value);
  }
  return result;
};

const simplex = new SimplexNoise("seed");

class ShapeVertices {
  private readonly vertices: number[] = [];
  private wire: THREE.LineSegments;
  private guide: THREE.Mesh;
  private shapeIndex: number;
  private touching: TouchingInfo[] = [];

  constructor(path: string, index: number, onLoadComplete: () => void) {
    this.shapeIndex = index;
    const loader = new OBJLoader();
    loader.load(path, (obj) => {
      const mesh: THREE.Mesh = obj.children[0] as THREE.Mesh;
      const wireframe = new THREE.WireframeGeometry(mesh.geometry);
      const line = new THREE.LineSegments(wireframe.clone());
      const guide = mesh.clone();
      const mat: LineBasicMaterial = line.material as LineBasicMaterial;
      mesh.geometry.attributes.position.needsUpdate = true;
      mat.linewidth = 1;
      mat.depthTest = false;
      mat.opacity = 0;
      mat.color = new THREE.Color("#f1acbc");
      mat.transparent = true;
      mat.blending = THREE.AdditiveBlending;
      this.wire = line;
      //
      const guideMat = guide.material as THREE.MeshBasicMaterial;
      guide.visible = false;
      guideMat.color = new THREE.Color("#00FF00");
      guideMat.opacity = 0;
      // guideMat.wireframe = true;
      guideMat.transparent = true;
      guideMat.side = THREE.BackSide;
      // guide.scale.add(new THREE.Vector3(-0.01, -0.01, -0.01));
      // guideMat.side = THREE.DoubleSide;

      this.guide = guide;
      //
      const position = line.geometry.getAttribute("position");
      const arr = position.array;
      for (let i = 0; i < arr.length; i++) {
        this.vertices.push(arr[i]);
      }
      line.geometry.setAttribute("originalPosition", position.clone());
      onLoadComplete();
      //
      guide.geometry.setAttribute(
        "touching",
        new THREE.Float32BufferAttribute(new Float32Array(position.count), 1)
      );
    });
  }

  getVertices() {
    return [...this.vertices];
  }

  fillVertices(until: number) {
    while (this.vertices.length <= until) {
      this.vertices.push(0);
    }
  }

  getItem(): THREE.LineSegments {
    return this.wire;
  }

  getGuide(): THREE.Mesh {
    return this.guide;
  }

  updateTouching(intersections: THREE.Intersection[]) {
    intersections.forEach((intersection) => {
      const touch = this.touching.find((r) => r.faceIndex === intersection.faceIndex);
      if (touch) {
      } else {
        this.touching.push({
          faceIndex: intersection.faceIndex,
          normal: intersection.face.normal,
          points: getPointsOfFace(
            intersection.face,
            (intersection.object as THREE.Mesh).geometry.getAttribute(
              "position"
            ) as THREE.Float32BufferAttribute
          ),
          power: 0,
        });
      }
    });
    this.touching.forEach((touch) => {
      if (intersections.find((intersection) => intersection.faceIndex === touch.faceIndex)) {
        touch.power = Math.min(touch.power + 0.04, 1);
      } else {
        touch.power -= 0.05;
      }
    });
    this.touching = this.touching.filter((r) => r.power > 0);
  }

  update(time: number, intersections: THREE.Intersection[]): number[] {
    if (!this.wire) return;
    const originalPosition = this.wire.geometry.getAttribute("originalPosition");
    const newPositions = [];
    this.updateTouching(intersections);

    //
    for (let i = 0; i < originalPosition.array.length; i += 3) {
      const currentPosition: THREE.Vector3 = new THREE.Vector3(
        originalPosition.array[i],
        originalPosition.array[i + 1],
        originalPosition.array[i + 2]
      );
      const extraY = Math.sin(time * 1.4 + originalPosition.array[i] / 40) * 2.5;
      const extraX = Math.sin(time * 1.2 + originalPosition.array[i + 1] / 20) * 2.3;
      if (this.shapeIndex === 0) {
        newPositions[i] = originalPosition.array[i];
        newPositions[i + 1] = originalPosition.array[i + 1] + extraY;
      } else {
        newPositions[i] = originalPosition.array[i] + extraX;
        newPositions[i + 1] = originalPosition.array[i + 1];
      }
      newPositions[i + 2] = originalPosition.array[i + 2];
      //
      const minDistance = 30;
      let distance: number = 1000;
      let myTouching: TouchingInfo;
      this.touching.forEach((t) => {
        t.points.forEach((p) => {
          const d = p.distanceTo(currentPosition);
          if (d < minDistance) {
            distance = d;
            myTouching = t;
          }
        });
      });
      if (myTouching) {
        const x = newPositions[i];
        const y = newPositions[i + 1];
        const z = newPositions[i + 2];
        const amp = 10;

        const d = (minDistance - distance) / minDistance;
        const distanceFactor = d * 1.2;
        const eased = easing(myTouching.power);

        // const noiseX = simplex.noise4D(x, y, z, w) * amp - amp / 2;
        // const noiseY = simplex.noise4D(x, y, z, w) * amp - amp / 2;
        // const noiseZ = simplex.noise4D(x, y, z, w) * amp - amp / 2;
        const noiseX = perlin4D(x, y, z, (time % 1) / 100) * amp - (amp / 2) * eased;
        const noiseY = perlin4D(y, z, x, (time % 1) / 100) * amp - (amp / 2) * eased;
        const noiseZ = perlin4D(z, x, y, (time % 1) / 100) * amp - (amp / 2) * eased;

        const touchingFactor = distanceFactor * 30 * eased;
        newPositions[i] += myTouching.normal.x * touchingFactor * -1 + noiseX * d;
        newPositions[i + 1] += myTouching.normal.y * touchingFactor * -1 + noiseY * d;
        newPositions[i + 2] += myTouching.normal.z * touchingFactor * -1 + noiseZ * d;
      }
    }
    this.wire.geometry.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
    return newPositions;
  }
}

const getPointFromBuffer = (index: number, buffer: THREE.Float32BufferAttribute): THREE.Vector3 => {
  return new THREE.Vector3(buffer.getX(index), buffer.getY(index), buffer.getZ(index));
};

const getPointsOfFace = (
  face: THREE.Face,
  points: THREE.Float32BufferAttribute
): THREE.Vector3[] => {
  return [
    getPointFromBuffer(face.a, points),
    getPointFromBuffer(face.b, points),
    getPointFromBuffer(face.c, points),
  ];
};

type TouchingInfo = {
  faceIndex: number;
  normal: THREE.Vector3;
  power: number;
  points: THREE.Vector3[];
};
