import { css } from "@emotion/react";
import BezierEasing from "bezier-easing";
import React, { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import { LineBasicMaterial } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { Pane } from "tweakpane";
import { Ease24, Tween24 } from "tween24";
import { rangeMap } from "yohak-tools";
import { degreeToRadian, radianToDegree } from "yohak-tools/dist/geom/angles";
import frag from "../shader/three07c.frag";
import vert from "../shader/three07c.vert";
import { fillAttribute, getPointsOfFace, setRandomPoints } from "../utils/three-utils";

export type ThreeParticles07cProps = {};

export const ThreeParticles07c: FC<ThreeParticles07cProps> = ({}) => {
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
const easing = BezierEasing(0.5, 0, 0.6, 1);
const uniforms: {
  uTime: { value: number };
  uColor: { value: THREE.Color };
  uMorphProgress: { value: number };
  uIsPoint: { value: boolean };
  uLineOpacity: { value: number };
  uWavePower: { value: number };
  uTouchPoints: { value: THREE.Vector3[] };
  uTouchNormals: { value: THREE.Vector3[] };
  uTouchPowers: { value: number[] };
  uParams: {
    value: {
      waveHeight: number;
      waveScale: number;
      noiseHeight: number;
      waveFreq: number;
      noiseFreq: number;
      touchDistance: number;
      touchNormalHeight: number;
      touchNoiseFreq: number;
      touchNoiseHeight: number;
      touchNoiseMix: number;
      touchWaveFreq: number;
      //
    };
  };
} = {
  uTime: { value: 0 },
  uColor: { value: new THREE.Color(0xff00ff) },
  uMorphProgress: { value: 0 },
  uIsPoint: { value: true },
  uLineOpacity: { value: 0.2 },
  uWavePower: { value: 0 },
  uTouchPoints: { value: [] },
  uTouchNormals: { value: [] },
  uTouchPowers: { value: [] },
  uParams: {
    value: {
      waveHeight: 0,
      waveScale: 0,
      noiseHeight: 0,
      waveFreq: 0,
      noiseFreq: 0,
      touchNoiseFreq: 0,
      touchDistance: 30,
      touchNormalHeight: 10,
      touchNoiseHeight: 0,
      touchNoiseMix: 0,
      touchWaveFreq: 0,
    },
  },
};
const threeParams: {
  rotationY: number;
  rotationX: number;
  rotationBrake: number;
  touchSpeed: number;
} = {
  touchSpeed: 6,
  rotationY: 7,
  rotationX: 15,
  rotationBrake: 50,
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
  camera.position.z = 300;
  camera.position.y = 40;
  camera.lookAt(objGroup.position);
  //
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(-1, -1);

  return { camera, scene, renderer, objGroup, raycaster, pointer };
};

const init = (canvas: HTMLCanvasElement): (() => void) => {
  const pane = initPane();
  const { camera, scene, renderer, objGroup, raycaster, pointer } = setupScene(canvas);

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
    const rX = threeParams.rotationX;
    const rY = threeParams.rotationY;
    cursorX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    cursorY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    targetRotationY = rangeMap([-1, 1], [rY, rY * -1], cursorX);
    targetRotationX = rangeMap([-1, 1], [rX, rX * -1], cursorY);
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
  let touches: TouchInfo[] = [];

  // const lineMat = new THREE.sha
  let randomPoints: THREE.Float32BufferAttribute;
  const onLoadItem = () => {
    loadCount++;
    if (loadCount < objectPaths.length) return;
    //
    particleGeom = new THREE.BufferGeometry();
    const maxPointCount = Math.max(...shapes.map((r) => r.getVertexPositions().array.length));
    const positions: Float32Array = new Float32Array(maxPointCount);
    randomPoints = setRandomPoints(maxPointCount, 1000);
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
    touches = [];
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
  const onClickCanvas = () => {
    if (isMorphing) return;
    //
    const nextIndex = (shapeIndex + 1) % shapes.length;
    const morphTarget = shapes[nextIndex];
    const params = {
      morph: 0,
      line: lineOpacity,
      wave: 1,
      rotation: radianToDegree(objGroup.rotation.y) % 360,
    };
    const positionLength = particleGeom.getAttribute("position").array.length;
    const targetPosition = fillAttribute(morphTarget.getVertexPositions(), positionLength);
    //
    const hideLine = Tween24.tween(params, 0.3, Ease24._Linear, { line: 0 });
    const showLine = Tween24.tween(params, 1, Ease24._2_QuadOut, { line: lineOpacity });
    const reduceWave = Tween24.tween(params, 0.6, Ease24._4_QuartOut, { wave: 0 });
    const addWave = Tween24.tween(params, 1, Ease24._2_QuadInOut, { wave: 1 });
    const morph1 = Tween24.tween(params, 1.2, Ease24._6_ExpoInOut, { morph: 1 });
    const morph2 = Tween24.tween(params, 0.7, Ease24._4_QuartInOut, { morph: 1 });
    const rotate1 = Tween24.tween(params, 2, Ease24._6_ExpoInOut, { rotation: 720 });
    hideLine.onUpdate(() => (uniforms.uLineOpacity.value = params.line));
    hideLine.onComplete(() => objGroup.remove(shapes[shapeIndex].getItem()));
    showLine.onInit(() => objGroup.add(shapes[nextIndex].getItem()));
    showLine.onUpdate(() => (uniforms.uLineOpacity.value = params.line));
    reduceWave.onUpdate(() => (uniforms.uWavePower.value = params.wave));
    addWave.onUpdate(() => (uniforms.uWavePower.value = params.wave));
    morph1.onUpdate(() => (uniforms.uMorphProgress.value = params.morph));
    morph1.onInit(() => particleGeom.setAttribute("targetPosition", randomPoints));
    morph1.onComplete(() => {
      particleGeom.setAttribute("position", randomPoints);
      particleGeom.setAttribute("targetPosition", targetPosition);
      uniforms.uMorphProgress.value = 0;
      params.morph = 0;
    });
    morph2.onUpdate(() => (uniforms.uMorphProgress.value = params.morph));
    morph2.onComplete(() => {
      particleGeom.setAttribute("position", targetPosition);
      uniforms.uMorphProgress.value = 0;
    });
    rotate1.onUpdate(() => (objGroup.rotation.y = degreeToRadian(params.rotation)));

    const seq = Tween24.parallel(
      Tween24.serial(hideLine, showLine.delay(1.8)),
      Tween24.serial(reduceWave, addWave.delay(0.3)),
      Tween24.serial(morph1, morph2.delay(0.7)),
      Tween24.serial(rotate1)
    );
    seq.onInit(() => {
      isMorphing = true;
      touches = [];
      objGroup.remove(guide);
    });
    seq.onComplete(() => {
      objGroup.rotation.y = 0;
      shapeIndex = nextIndex;
      isMorphing = false;
      guide = shapes[nextIndex].getGuide();
      objGroup.add(guide);
    });
    seq.play();
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
      const touchSpeed = threeParams.touchSpeed / 100;
      touches.forEach((t) => (t.power = Math.max(t.power - touchSpeed, 0)));
      if (intersection) {
        getPointsOfFace(
          intersection.face,
          particleGeom.getAttribute("position") as THREE.Float32BufferAttribute
        ).forEach((p) => {
          // console.log(p, intersections);
          const foundTouch = touches.find((t) => t.point.distanceTo(p) === 0);
          if (foundTouch) {
            foundTouch.power = Math.min(1, foundTouch.power + touchSpeed * 1.8);
          } else {
            touches.push({ point: p, power: touchSpeed, normal: intersection.face.normal });
          }
        });
      }
      touches = touches.filter((t) => t.power > 0);
      for (let i = 0; i < 64; i++) {
        uniforms.uTouchPoints.value[i] = touches[i]?.point || new THREE.Vector3(0, 0, 0);
        uniforms.uTouchPowers.value[i] = touches[i] ? easing(touches[i].power) : 0;
        uniforms.uTouchNormals.value[i] = touches[i]?.normal || new THREE.Vector3(0, 0, 0);
      }
      // console.log(uniforms.uTouchPowers.value);
    }
    if (objGroup) {
      const rotationY = radianToDegree(objGroup.rotation.y);
      const rotationX = radianToDegree(objGroup.rotation.x);
      const brake = threeParams.rotationBrake;
      // objGroup.rotation.y = degreeToRadian(rotationY + (targetRotationY - rotationY) / brake);
      objGroup.rotation.x = degreeToRadian(rotationX + (targetRotationX - rotationX) / brake);
      if (!isMorphing) {
        objGroup.rotation.y += degreeToRadian(threeParams.rotationY / 100);
      }
    }
    renderer.render(scene, camera);
    //
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
    pane.dispose();
    console.log("destroy");
  };
};

const initPane = (): Pane => {
  const pane = new Pane();
  const f1 = pane.addFolder({ title: "idle" });
  f1.addInput(uniforms.uParams.value, "waveHeight", { min: 0, max: 100 });
  f1.addInput(uniforms.uParams.value, "waveScale", { min: 0, max: 10 });
  f1.addInput(uniforms.uParams.value, "waveFreq", { min: 0, max: 30 });
  f1.addInput(uniforms.uParams.value, "noiseHeight", { min: 0, max: 100 });
  f1.addInput(uniforms.uParams.value, "noiseFreq", { min: 0, max: 100 });
  const f2 = pane.addFolder({ title: "touch" });
  f2.addInput(threeParams, "touchSpeed", { min: 0, max: 20, label: "speed" });
  f2.addInput(uniforms.uParams.value, "touchDistance", { min: 0, max: 300, label: "distance" });
  f2.addInput(uniforms.uParams.value, "touchNormalHeight", {
    min: 0,
    max: 200,
    label: "normalHeight",
  });
  f2.addInput(uniforms.uParams.value, "touchNoiseHeight", {
    min: 0,
    max: 200,
    label: "noiseHeight",
  });
  f2.addInput(uniforms.uParams.value, "touchNoiseFreq", { min: 0, max: 100, label: "noiseFreq" });
  f2.addInput(uniforms.uParams.value, "touchNoiseMix", { min: 0, max: 100, label: "noiseMix" });
  f2.addInput(uniforms.uParams.value, "touchWaveFreq", { min: 0, max: 100, label: "waveFreq" });
  const f3 = pane.addFolder({ title: "object" });
  f3.addInput(threeParams, "rotationY", { min: 0, max: 90 });
  f3.addInput(threeParams, "rotationX", { min: 0, max: 90 });
  f3.addInput(threeParams, "rotationBrake", { min: 1, max: 200 });
  //
  const copyButton = pane.addButton({ title: "COPY PARAMS" });
  copyButton.on("click", () => {
    navigator.clipboard.writeText(JSON.stringify(pane.exportPreset())).then(() => {
      window.alert("copied!");
    });
  });
  return pane;
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
