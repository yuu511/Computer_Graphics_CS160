attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform vec3 u_DiffuseLight;
uniform vec3 u_LightPosition;
uniform vec3 u_AmbientLight;
varying vec4 v_Color;

void main() {
  gl_Position = a_Position;
  vec3 normal = normalize(vec3(a_Normal));
  vec4 vertexPosition = a_Position; 
  vec3 lightDirection = normalize (vec3(u_LightPosition)) ;
  float nDotL = max(dot(lightDirection, normal), 0.0);
  // diffuse light 
  vec3 kd = u_DiffuseLight * a_Color.rgb * nDotL;
  // ambient light
  vec3 ambient = u_AmbientLight;
  v_Color = vec4(kd+ambient, 1);
}

// can pass things to the shader through (varyings?)


