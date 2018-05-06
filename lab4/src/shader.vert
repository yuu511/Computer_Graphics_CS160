uniform float u_vmode;
attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_Normal;
uniform vec3 u_DiffuseLight;
uniform vec3 u_LightPosition;
uniform vec3 u_AmbientLight;
uniform vec3 u_ViewPosition;
uniform vec3 u_specColor;
varying vec4 v_Color;
uniform float u_exponentV;
uniform vec3 u_specularLightV;

// mode 2
varying vec3 v_Normal;
varying vec3 v_Position;

void main() {
  gl_Position = a_Position;
  v_Position = vec3(a_Position);  
  v_Normal = normalize(vec3(a_Normal)); 
  v_Color = a_Color;

  // mode 1 = gouraud shading
  if (u_vmode == 1.0){
    vec3 normal = normalize(vec3(a_Normal));
    vec4 vertexPosition = a_Position; 
    vec3 lightDirection = normalize (vec3(u_LightPosition));
    float nDotL = max(dot(lightDirection, normal), 0.0);

    // ambient light
    vec3 ambient = u_AmbientLight;

    // diffuse light 
    vec3 kd = u_DiffuseLight * a_Color.rgb * nDotL;

    // specular
    float specularV = 0.0;
    float expV = u_exponentV;
    vec3 viewVecV = vec3 (0.0,0.0,-1.0);   
    vec3 reflectVecV = reflect(-lightDirection,normal);
    specularV = pow(max(dot(reflectVecV, viewVecV), 0.0), expV);
    vec3 specularDiff= specularV * u_specularLightV;
    v_Color = vec4(kd+ambient+specularDiff, 1);
  }
}
