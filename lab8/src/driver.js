
v_shaders = {}
f_shaders = {}
// create a plane
var triang = new Geometry();

let new_sky_box = []
let currentTriang = 1
// called when page is loaded
function main() {
    // retrieve <canvas> element
    var canvas = document.getElementById('webgl');
    // get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    v_shaders["cube"] = "";
    f_shaders["cube"] = "";
    v_shaders["sphere"] = "";
    f_shaders["sphere"] = "";
    v_shaders["triang"] = "";
    f_shaders["triang"] = "";
    v_shaders["cubeB"] = "";
    f_shaders["cubeB"] = "";
    v_shaders["pyramid"] = "";
    f_shaders["pyramid"] = "";

    // load shader files (calls 'setShader' when done loading)
    loadFile("shaders/cube_shader.vert", function(shader_src) {
        setShader(gl, canvas, "cube", gl.VERTEX_SHADER, shader_src);
    });

    loadFile("shaders/cube_shader.frag", function(shader_src) {
        setShader(gl, canvas, "cube", gl.FRAGMENT_SHADER, shader_src);
    });

    // load shader files (calls 'setShader' when done loading)
    loadFile("shaders/sphere_shader.vert", function(shader_src) {
        setShader(gl, canvas, "sphere", gl.VERTEX_SHADER, shader_src);
    });

    loadFile("shaders/sphere_shader.frag", function(shader_src) {
        setShader(gl, canvas, "sphere", gl.FRAGMENT_SHADER, shader_src);
    });

    // load shader files (calls 'setShader' when done loading)
    loadFile("shaders/triang_shader.vert", function(shader_src) {
        setShader(gl, canvas, "triang", gl.VERTEX_SHADER, shader_src);
    });

    loadFile("shaders/triang_shader.frag", function(shader_src) {
        setShader(gl, canvas, "triang", gl.FRAGMENT_SHADER, shader_src);
    });

    loadFile("shaders/cubeB_shader.vert", function(shader_src) {
        setShader(gl, canvas, "cubeB", gl.VERTEX_SHADER, shader_src);
    });

    loadFile("shaders/cubeB_shader.frag", function(shader_src) {
        setShader(gl, canvas, "cubeB", gl.FRAGMENT_SHADER, shader_src);
    });

    loadFile("shaders/pyramid_shader.vert", function(shader_src) {
        setShader(gl, canvas, "pyramid", gl.VERTEX_SHADER, shader_src);
    });

    loadFile("shaders/pyramid_shader.frag", function(shader_src) {
        setShader(gl, canvas, "pyramid", gl.FRAGMENT_SHADER, shader_src);
    });
}

// set appropriate shader and start if both are loaded
function setShader(gl, canvas, name, shader, shader_src) {
    if (shader == gl.VERTEX_SHADER)
       v_shaders[name] = shader_src;

    if (shader == gl.FRAGMENT_SHADER)
	   f_shaders[name] = shader_src;

    vShadersLoaded = 0;
    for (var shader in v_shaders) {
       if (v_shaders.hasOwnProperty(shader) && v_shaders[shader] != "") {
           vShadersLoaded += 1;
       }
    }

    fShadersLoaded = 0;
    for (var shader in f_shaders) {
        if (f_shaders.hasOwnProperty(shader) && f_shaders[shader] != "") {
            fShadersLoaded += 1;
        }
    }

    if(vShadersLoaded == Object.keys(v_shaders).length &&
       fShadersLoaded == Object.keys(f_shaders).length) {
        start(gl, canvas);
    }
}

function start(gl, canvas) {

    // Create camera
    var camera = new PerspectiveCamera(60, 1, 1, 100);
    camera.move(10,0,0,1);
    camera.move(2,1,0,0);
    camera.rotate(10,0,1,0);

    // Create scene
    var scene = new Scene(gl, camera);

    // Create a cube ( BG )
    var cubeB = new CubeGeometry(1);
    cubeB.setVertexShader(v_shaders["cubeB"]);
    cubeB.setFragmentShader(f_shaders["cubeB"]);
    cubeB.setPosition(new Vector3([0.0,0.0,0.0]));
    cubeB.setScale(new Vector3([50,50,50]));
    scene.addGeometry(cubeB);

    // Create a cube
    var cube = new CubeGeometry(1);
    cube.setVertexShader(v_shaders["cube"]);
    cube.setFragmentShader(f_shaders["cube"]);
    cube.setRotation(new Vector3([1,45,45]));
    cube.setPosition(new Vector3([3,0.0,0.0]));
    cube.setScale(new Vector3([0.75,0.75,0.75]));
    scene.addGeometry(cube);
    
    // triang.vertices = [-3, 0, 0.0,   -3, 1,0.0,  -2,1,0,  -2,0,0   ];
    // triang.indices = [0, 1, 2 , 2 , 3 , 0];
    // var uvs = [-4.0, 0.0, 0.0,  -4.0, 1.0, 0.0,  -2.0, 1.0, 0.0,   -2.0, -0.0, 0.0];
    // triang.addAttribute("a_uv", uvs);

    triang.vertices = [-3, 0, 0.0,   -3, 1,0.0,  -2,1,0,  -2,0,0, -3,-1,0, -2,-1,0 ];
    triang.indices = [0, 1, 2 , 2 , 3 , 0 , 1,3,4, 3,4,5];
    var uvs = [-4.0, 0.0, 0.0,  -4.0, 1.0, 0.0,  -2.0, 1.0, 0.0,   -2.0, -0.0, 0.0, -4.0,-1.0,0.0, -2.0,-1.0,0.0];
    triang.addAttribute("a_uv", uvs);

    triang.setVertexShader(v_shaders["triang"]);
    triang.setFragmentShader(f_shaders["triang"]);
    scene.addGeometry(triang);

    // Create a Sphere
    var sphere = new SphereGeometry(1, 32, 8);
    sphere.v_shader = v_shaders["sphere"];
    sphere.f_shader = f_shaders["sphere"];
    sphere.setPosition(new Vector3([0.0,0.0,0.0]));
    scene.addGeometry(sphere);
    scene.draw();

   // Create a Pyramid 
   var pyramid = new Geometry();
   pyramid.vertices = [-5.0,0.0,0.0, -5.0,0.0,1.0, -4.0,0.0,0.0, -4.0,0.0,1.0, -4.5,1.0,0.5] 
   pyramid.indices = [0,1,2, 1,2,3, 2,3,4, 1,2,4, 1,3,4, 0,3,4]
   pyramid.v_shader = v_shaders["pyramid"];
   pyramid.f_shader = f_shaders["pyramid"];
   scene.addGeometry(pyramid);
   scene.draw();
    
    var tex2 = new Texture2D(gl, 'img/beach/posz.jpg', function(tex) {
        console.log(tex);
	triang.addUniform("u_tex", "t2", tex);
        scene.draw();
    });

    var tex = new Texture3D(gl, [
        'img/beach/posx.jpg',
        'img/beach/posx.jpg',
        'img/beach/posx.jpg',
        'img/beach/posx.jpg',
        'img/beach/posx.jpg',
        'img/beach/posx.jpg',
        'img/beach/posx.jpg'
    ], function(tex) {
        cube.addUniform("u_cubeTex", "t3", tex);
        scene.draw();
    });

    // skybox
    var tex3 = new Texture3D(gl, [
        'img/beach/negx.jpg',
        'img/beach/posx.jpg',
        'img/beach/negy.jpg',
        'img/beach/posy.jpg',
        'img/beach/negz.jpg',
        'img/beach/posz.jpg'
    ], function(tex) {
        cubeB.addUniform("u_cubeTex", "t3", tex);
        scene.draw();
    });

    // sphere
    var tex4 = new Texture3D(gl, [
        'img/beach/negx.jpg',
        'img/beach/posx.jpg',
        'img/beach/negy.jpg',
        'img/beach/posy.jpg',
        'img/beach/negz.jpg',
        'img/beach/posz.jpg'
    ], function(tex) {
        sphere.addUniform("u_sphereTex", "t3", tex);
        scene.draw();
    });

    // pyramid
    var tex5 = new Texture3D(gl, [
        'img/beach/negx.jpg',
        'img/beach/posx.jpg',
        'img/beach/negy.jpg',
        'img/beach/posy.jpg',
        'img/beach/negz.jpg',
        'img/beach/posz.jpg'
    ], function(tex) {
        pyramid.addUniform("u_pyramidTex", "t3", tex);
        scene.draw();
    });
    window.onkeypress = function(ev){ keypress(ev, gl,camera,scene); };
    const sky_box = document.getElementById('sky_box')
    sky_box.onclick = function(ev){newSkybox(ev, gl,camera,scene); };
}


// various keypress functions
function keypress(ev, gl,camera,scene){
  if (ev.which == "h".charCodeAt(0)){
    rotate(ev,gl,camera,scene)
  }
  if (ev.which == "j".charCodeAt(0)){
    rotate(ev,gl,camera,scene)
  }
  if (ev.which == "k".charCodeAt(0)){
    rotate(ev,gl,camera,scene)
  }
  if (ev.which == "l".charCodeAt(0)){
    rotate(ev,gl,camera,scene)
  }
  if (ev.which == "i".charCodeAt(0)){
    zoom(ev,gl,camera,scene)
  }
  if (ev.which == "o".charCodeAt(0)){
    zoom(ev,gl,camera,scene)
  }
  if (ev.which == "a".charCodeAt(0)){
    move(ev,gl,camera,scene)
  }
  if (ev.which == "s".charCodeAt(0)){
    move(ev,gl,camera,scene)
  }
  if (ev.which == "d".charCodeAt(0)){
    move(ev,gl,camera,scene)
  }
  if (ev.which == "f".charCodeAt(0)){
    move(ev,gl,camera,scene)
  }
  if (ev.which == "1".charCodeAt(0)){
    plane_change(ev,gl,camera,scene)
  }
  if (ev.which == "2".charCodeAt(0)){
    plane_change(ev,gl,camera,scene)
  }
}

function rotate(ev,gl,camera,scene){
  if (ev.key == 'h'){
    camera.rotate(15,0,1,0);
    scene.draw();
  }
  if (ev.key == 'j'){
    camera.rotate(-15,1,0,0);
    scene.draw();
  }
  if (ev.key == 'k'){
    camera.rotate(15,1,0,0);
    scene.draw();
  }
  if (ev.key == 'l'){
    camera.rotate(-15,0,1,0);
    scene.draw();
  }
}
function zoom(ev,gl,camera,scene){
  if (ev.key == 'i'){
    camera.move(-2,0,0,1);
    scene.draw();
  }
  if (ev.key == 'o'){
    camera.move(2,0,0,1);
    scene.draw();
  }
}
function move(ev,gl,camera,scene){
  if (ev.key == 'a'){
    camera.move(-2,1,0,0);
    scene.draw();
  }
  if (ev.key == 's'){
    camera.move(2,0,1,0);
    scene.draw();
  }
  if (ev.key == 'd'){
    camera.move(-2,0,1,0);
    scene.draw();
  }
  if (ev.key == 'f'){
    camera.move(2,1,0,0);
    scene.draw();
  }
}

function newSkybox(ev,gl,camera,scene){
 var x = document.getElementById("newskybox").files;
 // skybox
 console.log(x)
 var reader = new FileReader()
 var tex3 = new Texture3D(gl, [
  x[0],
  x[1],
  x[2],
  x[3],
  x[4],
  x[5]
 ], function(tex) {
     cubeB.addUniform("u_cubeTex", "t3", tex);
     scene.draw();
 });
}

function plane_change(ev,gl,camera,scene){
  if (ev.key == '1'){
    currentTriang = currentTriang + 1
  }
  if (ev.key == '2'){
    if (currentTriang > 1 ){
      currentTriang = currentTriang - 1
    }
  }
  console.log(triang.vertices)
  console.log(triang.indices)
  console.log(currentTriang)
  
}
