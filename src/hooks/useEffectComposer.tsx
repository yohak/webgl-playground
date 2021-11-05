import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { useEffect } from "react";

export const useEffectComposer = () => {
  const scene = new THREE.Scene();
  const onCanvasLoaded = (canvas: HTMLCanvasElement) => {
    if (!canvas) {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // init scene
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 240;

    // init renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    renderer.setClearColor("#1d1d1d");
    renderer.setSize(width, height);

    // init object
    const object = new THREE.Object3D();
    scene.add(object);

    // add fog
    scene.fog = new THREE.Fog(0xffffff, 1, 1000);

    // add light
    const spotLight = new THREE.DirectionalLight(0xffffff);
    spotLight.position.set(1, 1, 1);
    scene.add(spotLight);
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // add object
    const geometry = new THREE.SphereBufferGeometry(2, 3, 4);
    for (let i = 0; i < 100; i++) {
      const material = new THREE.MeshPhongMaterial({
        color: 0x000000,
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position
        .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.1)
        .normalize();
      mesh.position.multiplyScalar(Math.random() * 400);
      mesh.rotation.set(
        Math.random() * 2,
        Math.random() * 2,
        Math.random() * 2
      );
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
      object.add(mesh);
    }

    // add postprocessing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const effectGlitch = new GlitchPass(16);
    // true => exstreme
    effectGlitch.goWild = false;
    effectGlitch.renderToScreen = true;
    composer.addPass(effectGlitch);

    // resize
    window.addEventListener("resize", () => handleResize({ camera, renderer }));

    animate({ object, composer });
  };

  // handle resize
  const handleResize = ({ camera, renderer }: any) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / width;
    camera.updateProjectionMatrix();
    renderer.setSize(width, width);
  };
  useEffect(() => {
    return () => window.removeEventListener("resize", () => handleResize);
  });

  // animation
  const animate = ({ object, composer }: any) => {
    window.requestAnimationFrame(() => animate({ object, composer }));
    object.rotation.x += 0.01;
    object.rotation.z += 0.01;
    composer.render();
  };

  return { onCanvasLoaded, scene };
};
