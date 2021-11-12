import { backgroundImages } from "polished";
import React, { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
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

export type ThreeParticles03cProps = {};

export const ThreeParticles03c: FC<ThreeParticles03cProps> = ({}) => {
  const wrapperRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    console.log("init");
    const destroy = init(wrapperRef.current);
    return () => {
      console.log("unmount");
      destroy();
    };
  }, []);
  return <canvas ref={wrapperRef} style={backgroundImages(`linear-gradient(#FFFFFF, #000000)`)} />;
};

const init = (canvas: HTMLCanvasElement): (() => void) => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const fov = 75;
  const near = 10;
  const far = 10000;
  const aspect = 1;
  //
  const renderer = new THREE.WebGLRenderer({ canvas });
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.aspect = canvas.width / canvas.height;
  camera.updateProjectionMatrix();
  const scene = new THREE.Scene();
  //
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  renderPass.clear = false;
  const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
  const bloomPass = new UnrealBloomPass(resolution, 0.3, 0.5, 0.7);
  const texturePass = new TexturePass(null, 1);
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load("/assets/background.jpg", function (map) {
    texturePass.map = map;
  });
  const copyPass = new ShaderPass(CopyShader);

  composer.addPass(texturePass);
  composer.addPass(renderPass);
  composer.addPass(copyPass);
  composer.addPass(bloomPass);
  //
  const onResizeWindow = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    // renderer.setPixelRatio(window.devicePixelRatio);
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
    targetRotationY = rangeMap([-1, 1], [75, -75], cursorX);
    targetRotationX = rangeMap([-1, 1], [15, -15], cursorY);
  };
  canvas.addEventListener("mousemove", onMouseMove);

  //

  const paths: string[] = ["/assets/gem3.obj", "/assets/torso.obj", "/assets/steering.obj"];
  let particleGeom: THREE.BufferGeometry;
  let loadCount = 0;
  let isMorphing: boolean = false;
  let shapeIndex = 0;
  const onLoadItem = () => {
    loadCount++;
    if (loadCount < paths.length) return;
    const maxPositions = Math.max(...shapes.map((r) => r.getVertices().length));
    shapes.forEach((shape) => shape.fillVertices(maxPositions));
    //
    particleGeom = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < maxPositions / 3; i++) {
      positions.push(Math.random() * 30 - 15, Math.random() * 30 - 15, Math.random() * 30 - 15);
    }
    particleGeom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial();
    particleMat.size = 1;
    particleMat.color.setHex(0xffffff);
    particleMat.depthTest = false;
    const particles = new THREE.Points(particleGeom, particleMat);
    objGroup.add(particles);
    //
    morphParticles(shapes[shapeIndex].getVertices());
  };
  const shapes: ShapeVertices[] = paths.map((p) => new ShapeVertices(p, onLoadItem));

  const morphParticles = (targetPositions: number[]) => {
    if (isMorphing) return;
    isMorphing = true;
    const originalPositions = particleGeom.getAttribute("position").array;
    let newPositions: number[];
    const obj = { percent: 0 };
    const tween = Tween24.tween(obj, 1, Ease24._6_ExpoInOut, { percent: 1 });
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
    shapeIndex++;
    if (shapeIndex >= shapes.length) shapeIndex = 0;
    morphParticles(shapes[shapeIndex].getVertices());
  };
  canvas.addEventListener("click", onClickCanvas);
  //
  let animationRequest: number;
  const render = () => {
    // renderer.render(scene, camera);
    composer.render();
    if (objGroup) {
      const rotationY = radianToDegree(objGroup.rotation.y);
      const rotationX = radianToDegree(objGroup.rotation.x);
      objGroup.rotation.y = degreeToRadian(rotationY + (targetRotationY - rotationY) / 50);
      objGroup.rotation.x = degreeToRadian(rotationX + (targetRotationX - rotationX) / 50);
    }
    //
    animationRequest = requestAnimationFrame(render);
  };
  animationRequest = requestAnimationFrame(render);

  //
  return () => {
    renderer.dispose();
    window.removeEventListener("resize", onResizeWindow);
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("click", onClickCanvas);
    cancelAnimationFrame(animationRequest);
    console.log("destroy");
  };
};

class ShapeVertices {
  private readonly vertices: number[] = [];

  constructor(path: string, onLoadComplete: () => void) {
    const loader = new OBJLoader();
    loader.load(path, (obj) => {
      const mesh: THREE.Mesh = obj.children[0] as THREE.Mesh;
      const geom = mesh.geometry;
      const arr = geom.getAttribute("position").array;
      for (let i = 0; i < arr.length; i++) {
        this.vertices.push(arr[i]);
      }
      onLoadComplete();
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
}
