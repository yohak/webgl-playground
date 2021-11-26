uniform vec3 color;
varying float vAlpha;
varying vec3 vPosition;

void main() {
//  vec3 newPosition = position;
//  vec3 myPosition = vUv;
  float opacity = 0.4;
  if(vPosition == vec3(0.,0.,0.)) { opacity = 0.;}
//  gl2.glEnable(GL.GL_BLEND);
//  gl2.glBlendFunc(GL.GL_SRC_ALPHA, GL.GL_ONE_MINUS_SRC_ALPHA);
//  gl_FragColor = vec4(100./255., 100./255., 210./255., 0.5);
  gl_FragColor = vec4(1., 1., 1., opacity);
}
