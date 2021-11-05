import css from "@emotion/css";
import * as PIXI from "pixi.js";
import React, { FC, useEffect, useRef } from "react";

export type Pixi01Props = {};

const canvasCSS = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  @media (min-width: 420px) {
    height: 100%;
  }
  @media (max-width: 420px) {
    height: 100vh;
  }
`;

export const PixiParticles01: FC<Pixi01Props> = ({}) => {
  const appCanvas = useRef<HTMLDivElement>();
  useEffect(() => {
    const canvas: HTMLDivElement = appCanvas.current;
    const bound = canvas.getBoundingClientRect();
    const app = new PIXI.Application({
      antialias: true,
      width: bound.width,
      height: bound.height,
      backgroundColor: 0xffffff,
    });
    canvas.appendChild(app.view);
    const emitter: Emitter = new Emitter(app);
    app.ticker.add(() => {
      emitter.update();
    });

    return () => {
      console.log("destory");
      app.destroy(true);
    };
  }, []);
  return <div ref={appCanvas} css={canvasCSS} />;
};

class Emitter {
  private particles: Particle[] = [];
  private deadPool: Particle[] = [];
  private readonly app: PIXI.Application;
  private readonly birthTime: number;
  private lastBirthGiven: number = 0;
  private birthRate = 100;
  constructor(app: PIXI.Application) {
    const now = new Date().getTime();
    this.birthTime = now;
    this.app = app;
    this.giveBirth(now);
  }
  update() {
    const now = new Date().getTime();
    if (now - this.lastBirthGiven > this.birthRate) {
      this.giveBirth(now);
    }
    this.particles.forEach((p) => p.update(now));
    const corpses = this.particles.filter((p) => !p.alive);
    // corpses.forEach((p) => p.graphics.parent.removeChild(p.graphics));
    this.deadPool = [...this.deadPool, ...corpses];
    this.particles = this.particles.filter((p) => p.alive);
  }

  private giveBirth(now: number) {
    this.lastBirthGiven = now;
    const stage = this.app.stage;
    const screen = this.app.screen;
    const particle = this.deadPool.length ? this.deadPool.pop() : new Particle();
    const x = Math.random() * (screen.width + 100) - 100;
    const y = screen.height + 50;
    //
    particle.init(now, x, y);
    stage.addChild(particle.container);
    this.particles.push(particle);
    // console.log("giveBirth", this.particles.length, this.deadPool.length);
  }
}

class Particle {
  get alive(): boolean {
    return this._alive;
  }
  readonly container: PIXI.Container;
  private _alive: boolean = true;
  private birthTime: number;
  private lastUpdate: number;
  //
  private waveFrequency: number;
  private waveStart: number;
  private baseAngle: number;
  private baseSpeed: number;

  constructor() {
    const container = new PIXI.Container();
    const circle = new PIXI.Graphics();
    container.addChild(circle);
    circle.beginFill(0x00aee4, Math.random() * 0.3 + 0.4);
    circle.drawCircle(0, 0, Math.random() * 10 + 10);
    circle.endFill();
    const bf = new PIXI.filters.BlurFilter();
    bf.blur = 16;
    // bf.multisample = PIXI.MSAA_QUALITY.HIGH;
    circle.filters = [bf];
    circle.cacheAsBitmap = true;
    this.container = container;
  }

  init(now: number, x: number, y: number) {
    this.birthTime = now;
    this.lastUpdate = now;
    this.container.x = x;
    this.container.y = y;
    //
    this.waveFrequency = Math.random() * 5 + 5;
    this.waveStart = Math.random() * degreeToRadian(180);
    this.baseAngle = pickAngle();
    this.baseSpeed = Math.random() * 2 + 2;
  }

  update(now: number) {
    const age = now - this.birthTime;
    const buoyancy = age / 1000;
    const velocity = ((now - this.lastUpdate) / 16) * this.baseSpeed + buoyancy;
    const container = this.container;
    const circle = container.getChildAt(0);
    const angle = degreeToRadian(this.baseAngle + 90);
    container.y -= Math.sin(angle) * velocity;
    container.x -= Math.cos(angle) * velocity;
    circle.x = Math.sin((age / 1000) * 3 + this.waveStart) * this.waveFrequency;
    //
    this.lastUpdate = now;
    this._alive = container.y >= -100;
  }
}

const degreeToRadian = (deg: number): number => {
  return (deg * Math.PI) / 180;
};
const pickAngle = (): number => {
  const arr = [0, 2, 5];
  return arr[Math.floor(Math.random() * arr.length)];
};
