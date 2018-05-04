uniform float u_vmode;
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform vec3 u_DiffuseLight;
uniform vec3 u_LightPosition;
uniform vec3 u_AmbientLight;
uniform vec3 u_ViewPosition;
varying vec4 v_Color;

void main() {
  gl_Position = a_Position;
  // mode 1 = gouraud shading
  if (u_vmode == 1.0){
    vec3 normal = normalize(vec3(a_Normal));
    vec4 vertexPosition = a_Position; 
    vec3 lightDirection = normalize (vec3(u_LightPosition)-vec3(vertexPosition));
    float nDotL = max(dot(lightDirection, normal), 0.0);

    // ambient light
    vec3 ambient = u_AmbientLight;

    // diffuse light 
    vec3 kd = u_DiffuseLight * a_Color.rgb * nDotL;

    v_Color = vec4(kd+ambient, 1);
  }
  if (u_vmode == 2.0){
  }
}
