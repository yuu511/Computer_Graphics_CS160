#ifdef GL_ES
precision mediump float;
#endif

uniform float u_fmode;
uniform float u_exponent;
varying vec4 v_Color;

// mode 2
varying vec3 v_Normal;
varying vec3 v_Position;
uniform vec3 u_DiffuseLightF;
uniform vec3 u_LightPositionF;
uniform vec3 u_AmbientLightF;
uniform vec3 u_SpecularLightF;
uniform vec3 u_ViewPositionF;


void main() {
  // specular 
  float specular = 0.0;
  float exponent = u_exponent;
  vec3 viewVec = u_ViewPositionF;
  vec3 lightDir = normalize(u_LightPositionF);
  vec3 reflectVec = reflect(-lightDir,v_Normal);
  specular = pow(max(dot(reflectVec, viewVec), 0.0), exponent);
  vec3 specularF = specular * u_SpecularLightF.rgb;

  // mode 1 = gouraud shading

  if (u_fmode == 1.0){
    gl_FragColor = vec4(v_Color.rgb + specularF, 1);
  }

  if (u_fmode == 2.0){
    vec3 normalF = normalize(vec3(v_Normal));
    vec3 vertexPositionF = v_Position; 
    vec3 lightDirectionF = normalize (vec3(u_LightPositionF)-vec3(vertexPositionF));
    float nDotLF = max(dot(lightDirectionF, normalF), 0.0);

    // ambient light
    vec3 ambientF = u_AmbientLightF;

    // diffuse light 
    vec3 kdF = u_DiffuseLightF * v_Color.rgb * nDotLF;

    gl_FragColor = vec4(kdF+ambientF+specularF, 1);
  }

  if (u_fmode == 3.0){
    vec3 normalF = normalize(vec3(v_Normal));
    vec3 vertexPositionF = v_Position; 
    vec3 lightDirectionF = normalize (vec3(u_LightPositionF)-vec3(vertexPositionF));
    float nDotLF = max(dot(lightDirectionF, normalF), 0.0);

    // ambient light
    vec3 ambientF = u_AmbientLightF;

    // diffuse light 
    vec3 kdF = u_DiffuseLightF * v_Color.rgb * nDotLF;

    // rim light  
    float rim = max(dot(v_Normal,normalize(u_ViewPositionF)),0.0);
    float rimF = 1.0 - rim;

    gl_FragColor = vec4(kdF+ambientF+specularF+rimF, 1);
  }
  //toon
  if (u_fmode == 4.0){
    vec3 normalF = normalize(vec3(v_Normal));
    vec3 vertexPositionF = v_Position; 
    vec3 lightDirectionF = normalize (vec3(u_LightPositionF)-vec3(vertexPositionF));
    float nDotLF = max(dot(lightDirectionF, normalF), 0.0);

    // ambient light
    vec3 ambientF = u_AmbientLightF;

    // diffuse light 
    float attenuation = 0.0;
    if (nDotLF > 0.5){
      attenuation = nDotLF;
    }
    if (nDotLF > 0.7){
      attenuation = nDotLF -.05;
    }
    if (nDotLF < 0.5){
      attenuation = 1.0+0.2;
    }
    vec3 kdF = u_DiffuseLightF * v_Color.rgb * nDotLF;
    kdF = attenuation * kdF;
   
    gl_FragColor = vec4(kdF+ambientF+specularF, 1);
  } 
  // depth
  if (u_fmode == 5.0){
    vec3 normalF = normalize(vec3(v_Normal));
    vec3 vertexPositionF = v_Position;  
    vec3 lightDirectionF = normalize (vec3(u_LightPositionF)-vec3(vertexPositionF));
    float nDotLF = max(dot(lightDirectionF, normalF), 0.0);

    // ambient light
    vec3 ambientF = u_AmbientLightF;

    // diffuse light 
    vec3 grey = vec3(0.5,0.5,0.5);
    vec3 kdF = u_DiffuseLightF * grey.rgb * nDotLF;

    // depth  
    float depth = max(dot(v_Normal,normalize(u_ViewPositionF)),0.0);

    gl_FragColor = vec4(kdF+ambientF+specularF+depth, 1);
  }
}
