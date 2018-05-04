attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform vec3 u_DiffuseLight;
uniform vec3 u_LightPosition;
uniform vec3 u_AmbientLight;
uniform vec3 u_SpecularLight;
uniform vec3 u_ViewPosition;
varying vec4 v_Color;

void main() {
  gl_Position = a_Position;
  vec3 normal = normalize(vec3(a_Normal));
  vec4 vertexPosition = a_Position; 
  vec3 lightDirection = normalize (vec3(u_LightPosition)-vec3(vertexPosition));
  float nDotL = max(dot(lightDirection, normal), 0.0);

  // ambient light
  vec3 ambient = u_AmbientLight;

  // diffuse light 
  vec3 kd = u_DiffuseLight * a_Color.rgb * nDotL;

  // specular light 
  float specular = 0.0;
  float d = max(dot(normal, lightDirection),0.0);
  if (d>0.0){
    vec3 viewVec = u_ViewPosition;
    vec3 reflectVec = reflect(-lightDirection,normal);
    specular = pow(max(dot(reflectVec, viewVec), 0.0), 1200.0);
  }
  vec3 spec = specular * u_SpecularLight;
  v_Color = vec4(kd+ambient+spec, 1);
}

// can pass things to the shader through (varyings?)


