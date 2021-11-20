// webpack + typescript + three.jsでGLSL (.frag|.vert) を外部モジュールとしてimportする
// https://blog.5ebec.dev/posts/webpack-ts-three-js-glsl/

declare module "*.vert" {
  const src: string;
  export default src;
}
declare module "*.frag" {
  const src: string;
  export default src;
}

declare module "*.glsl" {
  const src: string;
  export default src;
}
