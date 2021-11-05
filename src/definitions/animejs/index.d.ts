declare module "animejs";
declare const anime: AnimeStatic;
export default anime;

export interface AnimeStatic {
  <T>(params?: AnimeParams<T>): AnimeInstance;

  stagger(
    value: number | [number, number],
    opts?: StaggeringOptions
  ): StaggeringObject;

  timeline<T>(params?: AnimeParams<T>): AnimeTimeLine;

  path(target: Target): AnimePathInfo;

  setDashoffset: number;

  remove(target: Targets): void;

  get(target: Targets, propName: string, unit?: string): number;

  set(target: Targets, values: ValueParameters): void;

  random(min: number, max: number): number;

  tick(time: number): void;

  running: AnimeInstance[];
}

export interface AnimeInstance extends AnimationControl {}

export interface AnimeTimeLine extends AnimationControl {
  add<T>(params?: AnimeParams<T>, offset?: number | string): AnimeTimeLine;
}

type Target = string | Element | null;
type Targets = Target | Target[] | NodeList;

type BasicValueTypes = number | string;
type FunctionBasedParameters = (
  el: Element,
  index: number,
  targetsLength: number
) => BasicValueTypes;
type FromToValues = [BasicValueTypes, BasicValueTypes];

interface PointValue {
  value: string | string[];
}

type ValueTypes =
  | 1
  | BasicValueTypes
  | FromToValues
  | FunctionBasedParameters
  | SpecificPropertyParameters
  | SpecificPropertyParameters[]
  | PointValue
  | PointValue[];

interface AnimeParams<T = any>
  extends ValueParameters,
    PropertyParameters,
    AnimationParameters,
    CallBacks {
  targets?: Targets | T;
  keyframes?: (ValueParameters | PropertyParameters)[];
}

interface SpecificPropertyParameters extends PropertyParameters {
  value?: BasicValueTypes | FromToValues;
}

interface PropertyParameters {
  duration?: number | FunctionBasedParameters | StaggeringObject;
  delay?: number | FunctionBasedParameters | StaggeringObject;
  elasticity?: number | FunctionBasedParameters | StaggeringObject;
  endDelay?: number | FunctionBasedParameters | StaggeringObject;
  easing?: Easing | Function;
  round?: number;
}

interface AnimationParameters {
  direction?: "normal" | "reverse" | "alternate";
  loop?: number | boolean;
  autoplay?: boolean;
}

interface ValueParameters {
  // Transformations
  translateX?: ValueTypes;
  translateY?: ValueTypes;
  translateZ?: ValueTypes;
  rotate?: ValueTypes;
  rotateX?: ValueTypes;
  rotateY?: ValueTypes;
  rotateZ?: ValueTypes;
  scale?: ValueTypes;
  scaleX?: ValueTypes;
  scaleY?: ValueTypes;
  scaleZ?: ValueTypes;
  skew?: ValueTypes;
  skewX?: ValueTypes;
  skewY?: ValueTypes;
  perspective?: ValueTypes;

  // CSS
  opacity?: ValueTypes;
  color?: ValueTypes;
  backgroundColor?: ValueTypes;
  left?: ValueTypes;
  top?: ValueTypes;
  border?: ValueTypes;

  // SVG
  points?: ValueTypes;
  baseFrequency?: ValueTypes;
  strokeDashoffset?: ValueTypes;

  // DOM
  value?: ValueTypes;

  // Custom Props
  [prop: string]: any;
}

interface CallBacks {
  update?: (info: AnimationInfo) => void;
  begin?: (info: AnimationInfo) => void;
  complete?: (info: AnimationInfo) => void;
  loopBegan?: (info: AnimationInfo) => void;
  loopComplete?: (info: AnimationInfo) => void;
  changeBegan?: (info: AnimationInfo) => void;
  changeComplete?: (info: AnimationInfo) => void;
}

type AnimePathInfo = (val: "x" | "y" | "angle") => number;

interface AnimationInfo {
  progress: number;
  updates: number;
  began: boolean;
  completed: boolean;
}

export interface AnimationControl {
  play(): void;

  pause(): void;

  restart(): void;

  reverse(): void;

  seek(val: number): void;

  finished: Promise<any>;
}

interface StaggeringObject {}

interface StaggeringOptions {
  start?: number;
  from?: "first" | "last" | "center" | number;
  direction?: "normal" | "reverse";
  easing?: Easing;
  grid?: [number, number];
  axis?: "x" | "y";
}

type Easing =
  | "easeInSine"
  | "easeOutSine"
  | "easeInOutSine"
  | "easeInCirc"
  | "easeOutCirc"
  | "easeInOutCirc"
  | "easeInElastic"
  | "easeOutElastic"
  | "easeInOutElastic"
  | "easeInBack"
  | "easeOutBack"
  | "easeInOutBack"
  | "easeInBounce"
  | "easeOutBounce"
  | "easeInOutBounce"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic"
  | "easeInQuart"
  | "easeOutQuart"
  | "easeInOutQuart"
  | "easeInQuint"
  | "easeOutQuint"
  | "easeInOutQuint"
  | "easeInExpo"
  | "easeOutExpo"
  | "easeInOutExpo"
  | "linear"
  | "spring"
  | CustomEasingFunction
  | string
  | [number, number, number, number];

type CustomEasingFunction = (
  el: Element,
  index: number,
  targetsLength: number
) => (time: number) => number;
