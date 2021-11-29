uniform vec3 uColor;
uniform float uLineOpacity;
uniform bool uIsPoint;
varying float vAlpha;
varying float vPointSize;


void main() {
//  vec3 newPosition = position;
//  vec3 myPosition = vUv;
//  if(vPosition == vec3(0.,0.,0.)) { opacity = 0.;}
  float opacity = 0.;
  if(uIsPoint){
    opacity = 0.7;
    if(vPointSize == 0.) { opacity = 0.;}
    gl_FragColor = vec4(1.,1.,1., opacity);
  }else{
    opacity = uLineOpacity;
    gl_FragColor = vec4(241./255., 172./255., 188./255., opacity);
  }
}
