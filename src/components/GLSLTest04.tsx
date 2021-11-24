import { backgroundImages } from "polished";
import React, { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import frag from "../shader/04.frag";
import vert from "../shader/04.vert";

export type GLSLTest04Props = {};

export const GLSLTest04: FC<GLSLTest04Props> = ({}) => {
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
  const control = new OrbitControls(camera, renderer.domElement);
  const scene = new THREE.Scene();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  raycaster.params.Points.threshold = 0.1;
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
  const onPointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    // console.log(pointer);
  };
  document.addEventListener("pointermove", onPointerMove);

  const geom = new THREE.SphereBufferGeometry(1, 32, 32);
  const mat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    wireframe: true,
    fragmentShader: frag,
    vertexShader: vert,
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0xff00ff) },
      point: { value: new THREE.Vector3() },
    },
  });
  // const mesh = new THREE.Mesh(geom, mat);
  // scene.add(mesh);
  const points = new THREE.Points(geom, mat);
  scene.add(points);
  camera.lookAt(points.position);

  const focusPoint = new THREE.Vector3();
  //
  let animationRequest: number;
  const render = () => {
    raycaster.setFromCamera(pointer, camera);
    const intersections = raycaster.intersectObjects([points], false);
    const targetPoint = intersections.length ? intersections[0].point : new THREE.Vector3();
    focusPoint.x = focusPoint.x + (targetPoint.x - focusPoint.x) / 32;
    focusPoint.y = focusPoint.y + (targetPoint.y - focusPoint.y) / 32;
    focusPoint.z = focusPoint.z + (targetPoint.z - focusPoint.z) / 32;
    mat.uniforms.point.value = focusPoint;
    // renderer.render(scene, camera);
    control.update();
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
    document.removeEventListener("pointermove", onPointerMove);
    cancelAnimationFrame(animationRequest);
    console.log("destroy");
  };
};
