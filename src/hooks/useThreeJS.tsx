import { MutableRefObject, useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type BasicProps = {
  bgColor?: number;
};
export type BasicReturn = {
  wrapperRef: MutableRefObject<HTMLCanvasElement>;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  renderTime: number;
};

export const useThreeJS = ({ bgColor = 0x000000 }: BasicProps): BasicReturn => {
  const wrapperRef = useRef();
  const requestRef = useRef<number>();
  const [renderTime, setRenderTime] = useState(0);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();
  const [camera, setCamera] = useState<THREE.PerspectiveCamera>();
  const [scene, setScene] = useState<THREE.Scene>();

  // useState 初期化
  useEffect(() => {
    console.log("init");
    const canvas: HTMLCanvasElement = wrapperRef.current;
    canvas!.width = window.innerWidth;
    canvas!.height = window.innerHeight;
    const fov = 75;
    const near = 0.1;
    const far = 10000;
    const aspect = 1;
    setCamera(new THREE.PerspectiveCamera(fov, aspect, near, far));
    setScene(new THREE.Scene());
    setRenderer(new THREE.WebGLRenderer({ canvas }));
    //
  }, []);

  // すべての useStateに変数が入ったタイミングで初期化
  useEffect(() => {
    if (!camera || !renderer || !scene) return;
    const canvas: HTMLCanvasElement = wrapperRef.current;
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    camera.updateProjectionMatrix();
    //
    renderer.setClearColor(bgColor);

    const handleResize = () => {
      if (!camera || !renderer) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    //
    const render = () => {
      if (!renderer || !scene || !camera) return;
      setRenderTime((prev) => prev + 1);
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(render);
    };
    //
    window.addEventListener("resize", handleResize);
    requestAnimationFrame(render);
    return () => {
      console.log("unmount");
      setRenderTime(0);
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [camera, scene, renderer]);

  return { wrapperRef, camera, scene, renderer, renderTime };
};
