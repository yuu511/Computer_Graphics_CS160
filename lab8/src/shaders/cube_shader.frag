#ifdef GL_ES
precision mediump float;
#endif

uniform samplerCube u_cubeTex;

varying vec3 v_pos;
varying vec4 v_color;

void main() {
    vec4 genColor = textureCube(u_cubeTex, v_pos);
    vec4 color = vec4(0.3,0.0,0.0,1.0);
    gl_FragColor = vec4(genColor+color);
    // gl_FragColor
}
