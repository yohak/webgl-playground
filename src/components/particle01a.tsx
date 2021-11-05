import React, { FC, useEffect, useState } from "react";
import * as THREE from "three";
import { useThreeJS } from "../hooks/useThreeJS";

export type Particle01aProps = {};

export const Particle01a: FC<Particle01aProps> = ({}) => {
  const [emitterInterval, setEmitterInterval] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const clear = () => {};
  const bgColor: number = 0x000000;
  const { wrapperRef, camera, scene, renderTime } = useThreeJS({ bgColor });
  useEffect(() => {
    if (!camera || !scene) return;
    console.log("initComponent");
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    const emitter: THREE.Group = new THREE.Group();
    scene.add(emitter);
    emitter.position.y = -10;

    const map = new THREE.TextureLoader().load("/assets/circle.png");
    const material = new THREE.SpriteMaterial({ map });

    const interval = window.setInterval(() => {
      // const particle = new Particle(emitter, material, renderTime);
      // setParticles([...particles, particle]);
    }, 100);
    return () => {
      console.log("remove component");
      window.clearInterval(interval);
      clear();
    };
  }, [camera, scene]);
  useEffect(() => {
    if (!camera || !scene) return;
    camera.position.z = 10;
    particles.forEach((item) => item.update());
  }, [renderTime]);

  return <canvas ref={wrapperRef} />;
};

class Particle {
  private readonly sprite: THREE.Sprite;
  constructor(emitter: THREE.Group, material: THREE.SpriteMaterial, birthedAt: number) {
    this.sprite = new THREE.Sprite(material);
    this.sprite.position.set(Math.random() * 10, Math.random() * 10, 0);
    emitter.add(this.sprite);
    console.log(this.sprite);
  }
  update() {
    this.sprite.position.y += 0.1;
  }
}
