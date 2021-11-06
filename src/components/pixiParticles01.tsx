import css from "@emotion/css";
import * as PIXI from "pixi.js";
import React, { FC, useEffect, useRef, useState } from "react";
import { ParticleParams } from "./pixiParticles01GUI";

export type Pixi01Props = { params: ParticleParams };

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

export const PixiParticles01: FC<Pixi01Props> = ({ params }) => {
  const appCanvas = useRef<HTMLDivElement>();
  const [pixiApp, setPixiApp] = useState<PIXI.Application>();

  useEffect(() => {
    const destroy = () => {
      if (pixiApp) {
        console.log("destroy");
        pixiApp.destroy(true);
      }
    };
    destroy();
    const canvas: HTMLDivElement = appCanvas.current;
    const bound = canvas.getBoundingClientRect();
    const app = new PIXI.Application({
      antialias: true,
      width: bound.width,
      height: bound.height,
      backgroundColor: 0xffffff,
    });
    setPixiApp(app);
    canvas.appendChild(app.view);
    const emitter: Emitter = new Emitter(app, params);
    app.ticker.add(() => {
      emitter.update();
    });

    // return () => {
    //   console.log("unmount");
    //   destroy();
    // };
  }, [params]);
  return <div ref={appCanvas} css={canvasCSS} />;
};

class Emitter {
  private particles: Particle[] = [];
  private deadPool: Particle[] = [];
  private readonly app: PIXI.Application;
  private readonly birthTime: number;
  private readonly birthRate;
  private lastBirthGiven: number = 0;
  private readonly params: ParticleParams;

  constructor(app: PIXI.Application, params: ParticleParams) {
    const now = new Date().getTime();
    this.birthTime = now;
    this.app = app;
    this.birthRate = params.birthFreq;
    this.params = params;
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
    const particle = this.deadPool.length ? this.deadPool.pop() : new Particle(this.params);
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
  private waveSize: number;
  private waveStart: number;
  private waveFreq: number;
  private baseAngle: number;
  private baseSpeed: number;
  //
  private angles: number[];

  constructor(private params: ParticleParams) {
    const container = new PIXI.Container();
    const circle = new PIXI.Graphics();
    container.addChild(circle);
    circle.beginFill(
      parseInt(params.color.slice(1), 16),
      Math.random() * params.opacityRand + params.opacityBase
    );
    circle.drawCircle(0, 0, Math.random() * params.sizeRand + params.sizeBase);
    circle.endFill();
    const bf = new PIXI.filters.BlurFilter();
    bf.blur = params.blur;
    // bf.multisample = PIXI.MSAA_QUALITY.HIGH;
    circle.filters = [bf];
    circle.cacheAsBitmap = true;
    this.container = container;
    this.angles = [params.angleA, params.angleB, params.angleC];
  }

  init(now: number, x: number, y: number) {
    this.birthTime = now;
    this.lastUpdate = now;
    this.container.x = x;
    this.container.y = y;
    //
    const params = this.params;
    this.waveSize = Math.random() * params.waveSizeRand + params.waveSizeBase;
    this.waveFreq = Math.random() * params.waveFreqRand + params.waveFreqBase;
    this.waveStart = Math.random() * degreeToRadian(180);
    this.baseAngle = this.pickAngle();
    this.baseSpeed = Math.random() * params.speedRand + params.speedBase;
  }

  update(now: number) {
    const age = now - this.birthTime;
    const buoyancy = age / this.params.buoyancyRatio;
    const velocity = ((now - this.lastUpdate) / 16) * this.baseSpeed + buoyancy;
    const container = this.container;
    const circle = container.getChildAt(0);
    const angle = degreeToRadian(this.baseAngle + 90);
    container.y -= Math.sin(angle) * velocity;
    container.x -= Math.cos(angle) * velocity;
    circle.x = Math.sin((age / 1000) * this.waveFreq + this.waveStart) * this.waveSize;
    //
    this.lastUpdate = now;
    this._alive = container.y >= -100;
  }

  private pickAngle() {
    const arr = this.angles;
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

const degreeToRadian = (deg: number): number => {
  return (deg * Math.PI) / 180;
};
