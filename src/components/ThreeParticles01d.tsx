import { backgroundImages } from "polished";
import React, { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import { LineBasicMaterial } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { TexturePass } from "three/examples/jsm/postprocessing/TexturePass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";
import { rangeMap } from "yohak-tools";
import { degreeToRadian, radianToDegree } from "yohak-tools/dist/geom/angles";

export type ThreeParticles01dProps = {};

export const ThreeParticles01d: FC<ThreeParticles01dProps> = ({}) => {
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
  const bloomPass = new UnrealBloomPass(resolution, 0.0, 0.5, 0.5);
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
  let cursorX = 0;
  let cursorY = 0;
  let targetRotationY = 0;
  let targetRotationX = 0;
  let objGroup: THREE.Group;
  const onMouseMove = (e: MouseEvent) => {
    cursorX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    cursorY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    targetRotationY = rangeMap([-1, 1], [75, -75], cursorX);
    targetRotationX = rangeMap([-1, 1], [15, -15], cursorY);
  };
  canvas.addEventListener("mousemove", onMouseMove);

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
  const tempLight = new THREE.AmbientLight(0x404040);
  scene.add(tempLight);
  //
  const loader = new OBJLoader();
  loader.load("/assets/woman1.obj", (obj) => {
    objGroup = new THREE.Group();
    const mesh: THREE.Mesh = obj.children[0] as THREE.Mesh;
    const wireframe = new THREE.WireframeGeometry(mesh.geometry);
    const line = new THREE.LineSegments(wireframe);
    const mat: LineBasicMaterial = line.material as LineBasicMaterial;
    mat.linewidth = 1;
    mat.depthTest = false;
    mat.opacity = 0.3;
    mat.color = new THREE.Color("#f1acbc");
    mat.transparent = true;
    mat.blending = THREE.AdditiveBlending;
    objGroup.add(line);
    // //
    const pointGeom = mesh.geometry.clone();
    const pointMat = new THREE.PointsMaterial();
    pointMat.color.setHex(0xffffff);
    pointMat.size = 1.5;
    pointMat.depthTest = false;
    mat.transparent = true;
    mat.blending = THREE.AdditiveBlending;
    const points = new THREE.Points(pointGeom, pointMat);
    objGroup.add(points);
    // //
    scene.add(objGroup);
    //
    camera.position.z = 200;
    camera.position.y = 40;
    camera.lookAt(objGroup.position);
  });

  //
  return () => {
    renderer.dispose();
    window.removeEventListener("resize", onResizeWindow);
    canvas.removeEventListener("mousemove", onMouseMove);
    cancelAnimationFrame(animationRequest);
    console.log("destroy");
  };
};
