import React, { FC, useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type Particle01bProps = {};

export const Particle01b: FC<Particle01bProps> = ({}) => {
  const canvasRef = useRef<HTMLCanvasElement>();
  const [canvasRenderer, setCanvasRenderer] = useState<RenderCanvas>(null);
  useEffect(() => {
    setCanvasRenderer(new RenderCanvas(canvasRef.current));
    return () => {
      if (!canvasRenderer) return;
      canvasRenderer.destroy();
    };
  }, [canvasRef]);
  return <canvas ref={canvasRef} />;
};

class RenderCanvas {
  private readonly camera: THREE.PerspectiveCamera;
  private readonly scene: THREE.Scene;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly particles: Particle[] = [];
  private readonly birthTimer: number;
  //
  private renderRequest: number = 0;

  //
  constructor(private readonly canvas: HTMLCanvasElement) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //
    const fov = 75;
    const near = 0.1;
    const far = 10000;
    const aspect = 1;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.aspect = canvas.width / canvas.height;
    camera.updateProjectionMatrix();
    camera.updateProjectionMatrix();
    //
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas });
    const emitter = new THREE.Group();
    const material = new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load("/assets/circle.png"),
    });
    scene.add(emitter);

    console.log("init");
    window.addEventListener("resize", this.handleResize.bind(this));
    this.birthTimer = window.setInterval(() => {
      const particle = new Particle(material);
      emitter.add(particle.sprite);
      this.particles.push(particle);
    }, 16);

    emitter.position.y = -20;
    //
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    //
    this.render();
  }

  private render() {
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    //
    camera.position.z = 10;
    camera.position.y = 0;
    camera.lookAt(0, 0, 0);
    const now = new Date().getTime();
    this.particles.forEach((p) => p.update(now));
    //
    renderer.render(scene, camera);
    //
    this.renderRequest = requestAnimationFrame(() => this.render());
  }

  private handleResize() {
    const camera = this.camera;
    const renderer = this.renderer;
    //
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  //
  public destroy() {
    cancelAnimationFrame(this.renderRequest);
    console.log("destroy");
  }
}

class Particle {
  private readonly _sprite: THREE.Sprite;
  private readonly birthedAt: number;
  private readonly rotateMod: number;
  private readonly startX: number;
  get sprite() {
    return this._sprite;
  }

  constructor(material: THREE.SpriteMaterial) {
    this._sprite = new THREE.Sprite(material);
    this.startX = Math.random() * 10 - 5;
    this.sprite.position.set(this.startX, Math.random() * 10 - 5, 0);
    this.birthedAt = new Date().getTime();
    this.rotateMod = Math.random() * 500 + 500;
  }

  update(now: number) {
    this.sprite.position.y += 0.05;

    const elapsed = now - this.birthedAt;
    this.sprite.position.x = this.startX + Math.sin(elapsed / this.rotateMod) * 5;
  }
}
