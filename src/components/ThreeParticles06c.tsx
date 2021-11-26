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
import { Ease24, Tween24 } from "tween24";
import { rangeMap } from "yohak-tools";
import { degreeToRadian, radianToDegree } from "yohak-tools/dist/geom/angles";
import { valueBetween } from "yohak-tools/dist/geom/value-between";
import frag from "../shader/three06a.frag";
import vert from "../shader/three06a.vert";
import SimplexNoise from "simplex-noise";

export type ThreeParticles06cProps = {};

export const ThreeParticles06c: FC<ThreeParticles06cProps> = ({}) => {
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
  const bloomPass = new UnrealBloomPass(resolution, 0, 0.5, 0.7);
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
  document.addEventListener("mousemove", onMouseMove);

  const onMouseLeaveFromWindow = () => {
    targetRotationY = 0;
    targetRotationX = 0;
  };
  document.addEventListener("mouseout", onMouseLeaveFromWindow);

  //

  const paths: string[] = ["/assets/heart2.obj", "/assets/woman2.obj"];
  let particleGeom: THREE.BufferGeometry;
  let loadCount = 0;
  let shapeIndex: number = 0;
  let isMorphing: boolean = false;
  let time = 0;
  let verticesCount = 0;
  const particleMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    fragmentShader: frag,
    vertexShader: vert,
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0xff00ff) },
      point: { value: new THREE.Vector3() },
    },
    // transparent: true,
    depthTest: false,
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

    const particles = new THREE.Points(particleGeom, particleMat);
    console.log(particles);
    objGroup.add(particles);
    //
    showItem(0);
    particleGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(shapes[0].getVertices(), 3)
    );
  };
  const shapes: ShapeVertices[] = paths.map((p) => new ShapeVertices(p, onLoadItem));
  const lineOpacity = 0.3;

  const showItem = (index: number) => {
    const wire = shapes[index].getItem();
    const prop = { opacity: 0 };
    const tween = Tween24.tween(prop, 1, Ease24._4_QuartOut, { opacity: lineOpacity, scale: 1 });
    tween.onUpdate(() => {
      (wire.material as LineBasicMaterial).opacity = prop.opacity;
    });
    objGroup.add(wire);
    tween.play();
  };
  const hideItem = (index: number) => {
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
    // renderer.render(scene, camera);
    time += 0.05;
    if (!isMorphing) {
      const updated = shapes[shapeIndex].update(time);
      if (particleGeom) {
        const newPositions = fillArray(updated, 0, verticesCount);
        console.log(newPositions.length);
        particleGeom.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
      }
      //
    }

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

  constructor(path: string, onLoadComplete: () => void) {
    const loader = new OBJLoader();
    loader.load(path, (obj) => {
      const mesh: THREE.Mesh = obj.children[0] as THREE.Mesh;
      const wireframe = new THREE.WireframeGeometry(mesh.geometry);
      const line = new THREE.LineSegments(wireframe);
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
      const geom = line.geometry;
      const position = line.geometry.getAttribute("position");
      const arr = position.array;
      for (let i = 0; i < arr.length; i++) {
        this.vertices.push(arr[i]);
      }
      const seed: Float32Array = new Float32Array(arr.length / 3).map((r, i) =>
        simplex.noise3D(position.getX(i), position.getY(i), position.getZ(i))
      );
      line.geometry.setAttribute("seed", new THREE.BufferAttribute(seed, 1));
      line.geometry.setAttribute("originalPosition", position.clone());
      console.log(geom);
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

  getItem(): THREE.LineSegments {
    return this.wire;
  }

  update(time: number): number[] {
    if (!this.wire) return;
    // if (time % 0.5 !== 0) return;
    const originalPosition = this.wire.geometry.getAttribute("originalPosition");
    const seed = this.wire.geometry.getAttribute("seed");
    const newPositions = [];
    for (let i = 0; i < originalPosition.array.length; i += 3) {
      const extraY = Math.sin((time * (seed.array[i / 3] + 1)) / 2) * 0.9;
      newPositions[i] = originalPosition.array[i];
      newPositions[i + 1] = originalPosition.array[i + 1] + extraY;
      newPositions[i + 2] = originalPosition.array[i + 2];
    }
    this.wire.geometry.setAttribute("position", new THREE.Float32BufferAttribute(newPositions, 3));
    return newPositions;
  }
}
