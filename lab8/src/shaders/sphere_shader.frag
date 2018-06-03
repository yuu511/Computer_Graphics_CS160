#ifdef GL_ES
precision mediump float;
#endif
varying vec3 v_pos;
uniform samplerCube u_sphereTex;

void main() {
  gl_FragColor = textureCube(u_sphereTex, normalize(v_pos));
}
