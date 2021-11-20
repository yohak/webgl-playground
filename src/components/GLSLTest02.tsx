import { backgroundImages } from "polished";
import React, { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import frag from "../shader/02.frag";
import vert from "../shader/02.vert";

export type GLSLTest02Props = {};

export const GLSLTest02: FC<GLSLTest02Props> = ({}) => {
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
  const near = 0.001;
  const far = 1000;
  const aspect = 1;
  let time = 0;
  //
  const renderer = new THREE.WebGLRenderer({ canvas });
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.aspect = canvas.width / canvas.height;
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 2);
  const controll = new OrbitControls(camera, renderer.domElement);
  const scene = new THREE.Scene();
  //
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
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

  const geom = new THREE.PlaneGeometry(1, 1, 32, 32);
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    wireframe: true,
    fragmentShader: frag,
    vertexShader: vert,
    uniforms: { time: { value: 0 } },
  });
  const mesh = new THREE.Mesh(geom, mat);
  scene.add(mesh);
  camera.lookAt(mesh.position);
  console.log(scene);

  //
  let animationRequest: number;
  const render = () => {
    // renderer.render(scene, camera);
    controll.update();
    composer.render();
    time += 0.05;
    mat.uniforms.time.value = time;
    animationRequest = requestAnimationFrame(render);
  };
  animationRequest = requestAnimationFrame(render);

  //
  return () => {
    renderer.dispose();
    window.removeEventListener("resize", onResizeWindow);
    cancelAnimationFrame(animationRequest);
    console.log("destroy");
  };
};
