#ifdef GL_ES
precision mediump float;
#endif

uniform float u_fmode;
varying vec4 v_Color;


void main() {
  // mode 1 = gouraud shading
  if (u_fmode == 1.0){
    gl_FragColor = v_Color;
  }
  if (u_fmode == 2.0){
  }
}
