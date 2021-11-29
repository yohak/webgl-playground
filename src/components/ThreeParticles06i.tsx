import { css } from "@emotion/react";
import BezierEasing from "bezier-easing";
import React, { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import { LineBasicMaterial } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { Ease24, Tween24 } from "tween24";
import { rangeMap } from "yohak-tools";
import { degreeToRadian, radianToDegree } from "yohak-tools/dist/geom/angles";
import { TouchTexture } from "./TouchTexture";
import frag from "../shader/three06i.frag";
import vert from "../shader/three06i.vert";
import { fillAttribute, getPointsOfFace } from "../utils/three-utils";
export type ThreeParticles06iProps = {};

export const ThreeParticles06i: FC<ThreeParticles06iProps> = ({}) => {
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
const easing = BezierEasing(0.5, 0, 0.8, 1);
const uniforms: {
  uTime: { value: number };
  uColor: { value: THREE.Color };
  uMorphProgress: { value: number };
  uIsPoint: { value: boolean };
  uLineOpacity: { value: number };
  uWavePower: { value: number };
  uTouchPower: { value: number };
} = {
  uTime: { value: 0 },
  uColor: { value: new THREE.Color(0xff00ff) },
  uMorphProgress: { value: 0 },
  uIsPoint: { value: true },
  uLineOpacity: { value: 0.2 },
  uWavePower: { value: 0 },
  uTouchPower: { value: 0 },
};
const particleMat = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  // wireframe: true,
  fragmentShader: frag,
  vertexShader: vert,
  transparent: true,
  depthTest: false,
  uniforms,
});
const lineMat = new THREE.ShaderMaterial({
  // side: THREE.DoubleSide,
  wireframe: true,
  fragmentShader: frag,
  vertexShader: vert,
  transparent: true,
  depthTest: false,
  uniforms: { ...uniforms, uIsPoint: { value: false } },
  blending: THREE.AdditiveBlending,
});
const objectPaths: string[] = ["/assets/heart2.obj", "/assets/woman2.obj"];

const setupScene = (canvas: HTMLCanvasElement) => {
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
  //
  const objGroup: THREE.Group = new THREE.Group();
  scene.add(objGroup);
  camera.position.z = 200;
  camera.position.y = 40;
  camera.lookAt(objGroup.position);

  return { camera, scene, renderer, objGroup };
};

const initHitArea = (w: number, h: number, container: THREE.Object3D, camera: THREE.Camera) => {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-1, -1);
  const touch = new TouchTexture();
  return { raycaster, pointer };
};

const init = (canvas: HTMLCanvasElement): (() => void) => {
  const { camera, scene, renderer, objGroup } = setupScene(canvas);
  //

  //
  const { raycaster, pointer } = initHitArea(canvas.width, canvas.height, objGroup, camera);
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
  let cursorX = 0;
  let cursorY = 0;
  let targetRotationY = 0;
  let targetRotationX = 0;
  const onMouseMove = (e: MouseEvent) => {
    cursorX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    cursorY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    targetRotationY = rangeMap([-1, 1], [15, -15], cursorX);
    targetRotationX = rangeMap([-1, 1], [8, -8], cursorY);
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

  let particleGeom: THREE.BufferGeometry;
  let loadCount = 0;
  let shapeIndex: number = 0;
  let isMorphing: boolean = false;
  let time = 0;
  let guide: THREE.Mesh;
  let touchs: TouchInfo[] = [];

  // const lineMat = new THREE.sha
  const onLoadItem = () => {
    loadCount++;
    if (loadCount < objectPaths.length) return;
    //
    particleGeom = new THREE.BufferGeometry();
    const maxPointCount = Math.max(...shapes.map((r) => r.getVertexPositions().array.length));
    const positions: Float32Array = new Float32Array(maxPointCount);
    particleGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

    const particles = new THREE.Points(particleGeom, particleMat);
    objGroup.add(particles);
    //
    showItem(0);
    particleGeom.setAttribute(
      "position",
      fillAttribute(shapes[0].getVertexPositions(), maxPointCount)
    );
    particleGeom.setAttribute("normal", fillAttribute(shapes[0].getVertexNormals(), maxPointCount));
  };
  const shapes: ShapeVertices[] = objectPaths.map((p) => new ShapeVertices(p, onLoadItem));
  const lineOpacity = 0.07;

  const showItem = (index: number) => {
    touchs = [];
    const wire = shapes[index].getItem();
    guide = shapes[index].getGuide();
    objGroup.add(guide);
    const lineProp = { opacity: 0 };
    const lineTween = Tween24.tween(lineProp, 1, Ease24._4_QuartOut, {
      opacity: lineOpacity,
    });
    lineTween.onUpdate(() => {
      uniforms.uLineOpacity.value = lineProp.opacity;
    });
    const waveProp = { wave: 0 };
    const waveTween = Tween24.tween(waveProp, 1, Ease24._3_CubicInOut, {
      wave: 1,
    });
    waveTween
      .onUpdate(() => {
        uniforms.uWavePower.value = waveProp.wave;
      })
      .delay(0.1);
    waveTween.play();

    objGroup.add(wire);
    lineTween.play();
  };
  const hideItem = (index: number) => {
    const wire = shapes[index].getItem();
    objGroup.remove(guide);
    const prop = { opacity: lineOpacity, wave: 1 };
    const tween = Tween24.tween(prop, 0.6, Ease24._4_QuartOut, { opacity: 0, wave: 0 });
    tween.onUpdate(() => {
      uniforms.uLineOpacity.value = prop.opacity;
      uniforms.uWavePower.value = prop.wave;
    });
    tween.onComplete(() => {
      objGroup.remove(wire);
    });
    tween.play();
  };
  const morphParticles = (target: ShapeVertices) => {
    const positionLength = particleGeom.getAttribute("position").array.length;
    const targetPosition = fillAttribute(target.getVertexPositions(), positionLength);
    particleGeom.setAttribute("targetPosition", targetPosition);
    const obj = { percent: 0 };
    const tween = Tween24.tween(obj, 1, Ease24._4_QuartInOut, { percent: 1 });
    tween.onUpdate(() => {
      time = 0;
      uniforms.uMorphProgress.value = obj.percent;
    });
    tween.onComplete(() => {
      time = 0;
      isMorphing = false;
      particleGeom.setAttribute("position", targetPosition);
      particleGeom.setAttribute("normal", fillAttribute(target.getVertexNormals(), positionLength));
      uniforms.uMorphProgress.value = 0;
    });
    tween.play();
  };
  const onClickCanvas = () => {
    if (isMorphing) return;
    //
    isMorphing = true;
    const nextIndex = (shapeIndex + 1) % shapes.length;
    const morphTarget = shapes[nextIndex];
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
    time += 0.1;
    uniforms.uTime.value = time;
    if (particleGeom) {
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObject(guide);
      const intersection = intersections[0];
      touchs.forEach((t) => (t.power = Math.max(t.power - 0.04, 0)));
      if (intersection) {
        getPointsOfFace(
          intersection.face,
          particleGeom.getAttribute("position") as THREE.Float32BufferAttribute
        ).forEach((p) => {
          // console.log(p, intersections);
          const foundTouch = touchs.find((t) => t.point.distanceTo(p) === 0);
          if (foundTouch) {
            foundTouch.power = Math.min(1, foundTouch.power + 0.03 + 0.07);
          } else {
            touchs.push({ point: p, power: 0.03, normal: intersection.face.normal });
          }
        });
      }
      touchs = touchs.filter((t) => t.power > 0);
      uniforms.uTouchPower.value = Math.max(...touchs.map((t) => t.power), 0);

      // console.log(uniforms.uTouchPowers.value);
    }
    if (objGroup) {
      const rotationY = radianToDegree(objGroup.rotation.y);
      const rotationX = radianToDegree(objGroup.rotation.x);
      objGroup.rotation.y = degreeToRadian(rotationY + (targetRotationY - rotationY) / 50);
      objGroup.rotation.x = degreeToRadian(rotationX + (targetRotationX - rotationX) / 50);
    }
    renderer.render(scene, camera);
    //
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

type TouchInfo = {
  point: THREE.Vector3;
  power: number;
  normal: THREE.Vector3;
};

class ShapeVertices {
  private originalMesh: THREE.Mesh;
  private mesh: THREE.Mesh;
  private guide: THREE.Mesh;

  constructor(path: string, onLoadComplete: () => void) {
    const loader = new OBJLoader();
    loader.load(path, (obj) => {
      this.originalMesh = obj.children[0] as THREE.Mesh;
      this.originalMesh.geometry.computeVertexNormals();
      console.log(this.originalMesh);
      this.mesh = this.originalMesh.clone();
      this.mesh.material = lineMat;
      this.guide = this.originalMesh.clone();
      // this.guide.scale.add(new THREE.Vector3(-0.1, -0.1, -0.1));
      const guideMat = this.guide.material as LineBasicMaterial;
      this.guide.visible = false;
      guideMat.color = new THREE.Color("#00FF00");
      guideMat.opacity = 0.2;
      // guideMat.wireframe = true;
      guideMat.transparent = true;
      guideMat.side = THREE.BackSide;
      //

      onLoadComplete();
    });
  }

  getVertexPositions(): THREE.Float32BufferAttribute {
    return this.originalMesh.geometry.getAttribute("position").clone();
  }

  getVertexNormals(): THREE.Float32BufferAttribute {
    return this.originalMesh.geometry.getAttribute("normal").clone();
  }

  getItem(): THREE.Mesh {
    return this.mesh;
  }

  getGuide(): THREE.Mesh {
    return this.guide;
  }
}
