
v_shaders = {}
f_shaders = {}
// our shapes
var sphere = new SphereGeometry(1, 32, 8);
var triang = new Geometry();
var cubeB = new CubeGeometry(1);
var cube = new CubeGeometry(1);

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
    cubeB.setVertexShader(v_shaders["cubeB"]);
    cubeB.setFragmentShader(f_shaders["cubeB"]);
    cubeB.setPosition(new Vector3([0.0,0.0,0.0]));
    cubeB.setScale(new Vector3([50,50,50]));
    scene.addGeometry(cubeB);

    // Create a cube
    cube.setVertexShader(v_shaders["cube"]);
    cube.setFragmentShader(f_shaders["cube"]);
    cube.setRotation(new Vector3([1,45,45]));
    cube.setPosition(new Vector3([3,0.0,0.0]));
    cube.setScale(new Vector3([0.75,0.75,0.75]));
    scene.addGeometry(cube);

    triang.vertices = [-3, 1,0.0,  -2,1,0,  -3, 0, 0.0,  -2,0,0];
    triang.indices = [0, 1, 2 , 1,2,3];
    var uvs = [-4.0, 1.0, 0.0,  -2.0, 1.0, 0.0, -4.0, 0.0, 0.0,  -2.0, -0.0, 0.0];
    triang.addAttribute("a_uv", uvs);

    triang.setVertexShader(v_shaders["triang"]);
    triang.setFragmentShader(f_shaders["triang"]);
    scene.addGeometry(triang);

    // Create a Sphere
    sphere.v_shader = v_shaders["sphere"];
    sphere.f_shader = f_shaders["sphere"];
    sphere.setPosition(new Vector3([0.0,0.0,0.0]));
    scene.addGeometry(sphere);
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

    window.onkeypress = function(ev){ keypress(ev, gl,camera,scene); };
    const sky_box = document.getElementById('sky_box')
    const shift_textures = document.getElementById('shift_textures')
    sky_box.onclick = function(ev){newSkybox(ev, gl,camera,scene); };
    shift_textures.onclick = function(ev){shift(ev, gl,camera,scene); };
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
 var reader = new FileReader()
 let urls = []
 for (var i = 0 ; i < x.length; i++){
   urls.push(URL.createObjectURL(x[i]))
 }
 if (urls.length != 6 ){
   alert("PLEASE SELECT 6 SQUARE IMAGES!")
   return
 }
 var tex = new Texture3D(gl, [
    urls[0],
    urls[0],
    urls[0],
    urls[0],
    urls[0],
    urls[0]
 ], function(tex) {
     cube.addUniform("u_cubeTex", "t3", tex);
     scene.draw();
 });

 // skybox
 var tex3 = new Texture3D(gl, [
    urls[0],
    urls[1],
    urls[2],
    urls[3],
    urls[4],
    urls[5]
 ], function(tex) {
     cubeB.addUniform("u_cubeTex", "t3", tex);
     scene.draw();
 });

 // sphere
 var tex4 = new Texture3D(gl, [
    urls[0],
    urls[1],
    urls[2],
    urls[3],
    urls[4],
    urls[5]
 ], function(tex) {
     sphere.addUniform("u_sphereTex", "t3", tex);
     scene.draw();
 });

 var tex2 = new Texture2D(gl, urls[1], function(tex) {
     console.log(tex);
     triang.addUniform("u_tex", "t2", tex);
     scene.draw();
 });
}

function plane_change(ev,gl,camera,scene){
  if (ev.key == '1'){
    currentTriang = currentTriang + 1
  }
  if (ev.key == '2'){
    if (currentTriang > 0 ){
      currentTriang = currentTriang - 1
    }
  }
  let newV =([-3, 1,0.0,  -2,1,0,  -3, 0, 0.0,  -2,0,0])
  let newI =([0, 1, 2 , 1,2,3]) 
  let newUV =([-4.0, 1.0, 0.0,  -2.0, 1.0, 0.0, -4.0, 0.0, 0.0,  -2.0, -0.0, 0.0])
  for (var i=1 ; i < currentTriang ; i++){
    newV.push(-3)
    newV.push(-i)
    newV.push(0)
    newV.push(-2)
    newV.push(-i)
    newV.push(0)
    newI.push(2*i)
    newI.push(2*i+1)
    newI.push(2*i+2)
    newI.push(2*i+1)
    newI.push(2*i+2)
    newI.push(2*i+3)
    newUV.push(-4)
    newUV.push(-i)
    newUV.push(0)
    newUV.push(-2)
    newUV.push(-i)
    newUV.push(0)
  }
  triang.vertices = newV
  triang.indices = newI
  triang.addAttribute("a_uv",newUV)
  triang.setVertexShader(v_shaders["triang"]);
  triang.setFragmentShader(f_shaders["triang"]);
  scene.draw();
}

function shift(ev,gl,camera,scene){

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
        'img/beach/posz.jpg',
        'img/beach/negz.jpg',
        'img/beach/posy.jpg',
        'img/beach/negy.jpg',
        'img/beach/posy.jpg',
        'img/beach/negx.jpg'
    ], function(tex) {
        cubeB.addUniform("u_cubeTex", "t3", tex);
        scene.draw();
    });

    // sphere
    var tex4 = new Texture3D(gl, [
        'img/beach/posz.jpg',
        'img/beach/negz.jpg',
        'img/beach/posy.jpg',
        'img/beach/negy.jpg',
        'img/beach/posy.jpg',
        'img/beach/negx.jpg'
    ], function(tex) {
        sphere.addUniform("u_sphereTex", "t3", tex);
        scene.draw();
    });
}
