// Elijah Cordova 1425119

// Various snippets of code from ClickedPoints / Hello Triangle by Roger/Lea (Given to us by class)
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';


// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

var FSIZE = 4 

// the number we will be using to model pi
const pi = 3.1459

// refrence for the rubber band line
let previousX = null
let previousY = null 

// g_points = current working line, oldlines = all finished lines (an array of arrays)
let g_points = [] // The array for the position of a mouse press
let oldlines = [] // all previous completed lines

// width = current width, oldwidths = all old widths
let width = 1.0 //current working width (thickness of line)
let oldwidths = [] //all old widths

// (x)Color = current color setting, oldcolors = all old colors (an array of arrays)
let Rcolor = 1
let Gcolor = 0
let Bcolor = 0
let Acolor = 1
let oldcolors = [] // array of colors in each individual cylinder 
let cylindercolors = [] //array of oldcolors 
const defaultcolor = []
defaultcolor.push(Rcolor)
defaultcolor.push(Gcolor)
defaultcolor.push(Bcolor)
defaultcolor.push(Acolor)

// formvalue = for game, size of point = default point size
let formvalue = -1 
let sizeofpoint = 10.0 

// cylinder_points = currently drawing cylinder points
// sides = number of size the cylinder will have
let cylinder_points = []
let sides = 10
let radius = 0.25
let radii = []
let cylinderradii = []
function main() {
  // Retrieve <canvas> element
  const canvas = document.getElementById('webgl');


//  const sliderSize = document.getElementById('newslider')
  const sliderR = document.getElementById('sliderR')
  const sliderG = document.getElementById('sliderG')
  const sliderB = document.getElementById('sliderB')
  const sliderA = document.getElementById('sliderA')
  const textDelete = document.getElementById('textDelete')
  const buttonDelete = document.getElementById('buttonDelete')
  const sliderSides = document.getElementById('sliderSides')
  const sliderRadius = document.getElementById('sliderRadius')

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  

  // Register function (event handler) to be called on a mouse press
  canvas.oncontextmenu = function(ev){ rightclick(ev, gl, canvas, a_Position); };
  canvas.onmousedown = function(ev){ leftclick(ev, gl, canvas, a_Position); };
  canvas.onmousemove = function(ev){ move(ev, gl, canvas, a_Position); };
  canvas.onkeydown = function(ev){ key(ev, gl, canvas, a_Position); };

//  sliderSize.oninput = function(ev){ pointThick(ev, gl, canvas, sliderSize,  a_Position); };
  sliderR.oninput = function(ev){ Rslider(ev, gl, canvas, sliderR,  a_Position); };
  sliderG.oninput = function(ev){ Gslider(ev, gl, canvas, sliderG,  a_Position); };
  sliderB.oninput = function(ev){ Bslider(ev, gl, canvas, sliderB,  a_Position); };
  sliderA.oninput = function(ev){ Aslider(ev, gl, canvas, sliderA,  a_Position); };
  buttonDelete.onclick = function(ev){ deleteCylinder(ev, gl, canvas, textDelete,  a_Position); };
  sliderSides.oninput = function(ev){ changeSides(ev, gl, canvas, sliderSides,  a_Position); };
  sliderRadius.oninput = function(ev){ changeRadius(ev, gl, canvas, sliderRadius,  a_Position); };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
 
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT); 
}

function leftclick(ev, gl, canvas, a_Position) {  
  // if left click 
  if (ev.button == 2)
    return
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect() ;

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  console.log(x + " " + y + " left click\n")
  previousX = x
  previousY = y
  // Store the coordinates to g_points array
  g_points.push(x); g_points.push(y);
   
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
 
 // draw all finished cylinder 
 drawAllCylinders(gl,canvas,a_Position)

 var vertices = new Float32Array(g_points)
 // draw currently working line with points
 const colors = []
 colors.push(Rcolor)
 colors.push(Gcolor)
 colors.push(Bcolor)
 colors.push(Acolor)
 oldcolors.push(colors)
 radii.push(radius)
 draw (gl,canvas,a_Position,vertices,width,colors)
}

function move(ev, gl, canvas, a_Position) { 
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  if ( previousX === null || previousY === null) 
    return 
   
 // Clear <canvas>
 gl.clear(gl.COLOR_BUFFER_BIT);
   
 // draw all finished cylinder 
 drawAllCylinders(gl,canvas,a_Position)

 // draw currently working line (Elastic line)
 const colors = []
 colors.push(Rcolor)
 colors.push(Gcolor)
 colors.push(Bcolor)
 colors.push(Acolor)
 var vertices = new Float32Array(g_points)
 draw (gl,canvas,a_Position,vertices,width,colors)
  vertices = new Float32Array([
    previousX, previousY, x, y 
  ]); 
  var n =2 //the number of vertices    
  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
 
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }

  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.LINE_STRIP, 0, n)
}

function rightclick(ev, gl, canvas, a_Position) { 
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  console.log(x + " " + y + " right click\n")
  var archive = new Float32Array(g_points)
  oldlines.push (archive)
  oldwidths.push (width)
  cylinderradii.push(radii)
  cylindercolors.push(oldcolors)
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);


  // draw all finished cylinder 
  drawAllCylinders(gl,canvas,a_Position)
  previousX = null  
  previousY = null
  oldcolors = []
  g_points = []
  radii=[]
}

// initialize vertex buffer
function initVertexBuffer(gl) {
    // create buffer object
    var vertex_buffer = gl.createBuffer();
    if (!vertex_buffer) {
	console.log("failed to create vertex buffer");
	return false;
    }
    // bind buffer objects to targets
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    return true;
}

// initialize index buffer
function initIndexBuffer(gl) {
    // create buffer object
    var index_buffer = gl.createBuffer();
    if (!index_buffer) {
	console.log("failed to create index buffer");
	return false;
    }
    // bind buffer objects to targets
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    return true;
}

// set data in vertex buffer (given typed float32 array)
function setVertexBuffer(gl, vertices) {
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

// set data in index buffer (given typed uint16 array)
function setIndexBuffer(gl, indices) {
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
}

// initializes attributes
function initAttributes(gl) {
    // assign buffer to a_Position and enable assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
	console.log("failed to get storage location of a_Position");
	return false;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 3, 0);
    gl.enableVertexAttribArray(a_Position);
    return true;
}

// lab1 junk
// generic drawing function, will draw line with all vertices specified below.
function draw (gl,canvas,a_Position,vertices,linewidth,colors){   
 gl.lineWidth(linewidth)
 updateColor (gl,a_Position,colors[0],colors[1],colors[2],colors[3])
 var len = vertices.length;
 if (len === 0)
  return

  var success = initVertexBuffer(gl)
  if (!success) {
	console.log('Failed to initialize buffers.')
	return
  }
  setVertexBuffer (gl,vertices)
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.LINE_STRIP, 0, len/2);

  for(var i = 0; i < len; i += 2) {
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, vertices[i], vertices[i+1], 0.0);

    // Draw
    gl.drawArrays(gl.POINTS, 0, len/2);
  }
}


//draws a generalized cylinder 
function drawGeneralizedCylinder (gl,canvas,a_Position,vertices,linewidth,colors){   
  gl.lineWidth(linewidth)
  updateColor (gl,a_Position,colors[0],colors[1],colors[2],colors[3])
  FSIZE = 4
  // initialize buffers
   var success = initVertexBuffer(gl);
    success = success && initIndexBuffer(gl);
    success = success && initAttributes(gl);  
    if (!success) {
        console.log('Failed to initialize buffers.');
        return;
    }
  // # of vertices on base 
  let len = vertices.length/6;
  if (len === 0)
   return
  setVertexBuffer(gl,vertices)
  var indices = []
   for (var i=0 ; i < len-1; i++){
    indices.push(i)
    indices.push(i+1) 
    indices.push(len+i)
    indices.push(i)

    indices.push(len+i)
    indices.push(len+i+1) 
    indices.push(i+1)
    indices.push(len+i)

    indices.push(len+i)
    indices.push(len+i+1) 
    indices.push(i)
    indices.push(len+i)
  }
  indices = new Int16Array(indices)
  setIndexBuffer(gl,indices)
  gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);   
  c_points = []
}

// simple function to draw all cylinders based on all established line segments
function drawAllCylinders(gl,canvas,a_Position){
  // draw all finished cylinder 
  for (var i =0 ; i < oldlines.length ; i++){       
    if (oldlines[i].length >= 4){
     var loop = (((oldlines[i].length/2)-1)*2)
     for (var j =0; j < loop;j+=2){    
      drawcylinder(gl,canvas,a_Position,cylinderradii[i][j/2],oldlines[i][j],oldlines[i][j+1],oldlines[i][j+2],oldlines[i][j+3],cylindercolors[i][j/2])
      cylinder_points = []
     }
    }
  }  
}

function pointThick(ev, gl, canvas, sliderSize, a_Position) { 
  width=sliderSize.value
}

function Rslider(ev, gl, canvas, sliderR, a_Position) { 
  Rcolor=sliderR.value
}

function Gslider(ev, gl, canvas, sliderG, a_Position) { 
  Gcolor=sliderG.value
}

function Bslider(ev, gl, canvas, sliderB, a_Position) { 
  Bcolor=sliderB.value
}

function Aslider(ev, gl, canvas, sliderA, a_Position) { 
  Acolor=sliderA.value
}

function deleteCylinder(ev, gl, canvas, textDelete, a_Position) { 
  let  deletenumber = parseInt(textDelete.value)
  if (isNaN(deletenumber)){
   return
  }
//  //  edge case where we have someone attempting to delete a line that you are currently drawing
//  if (deletenumber==oldlines.length+1 && (previousX!==null || previousY!==null)){
//    if (oldlines.length >= 0){
//      gl.clear(gl.COLOR_BUFFER_BIT);
//      for (var i =0 ; i < oldlines.length ; i++){       
//        draw (gl,canvas,a_Position,oldlines[i],oldwidths[i],defaultcolor)
//      } 
//      previousX = null
//      previousY = null
//      g_points = []
//    }
//   return
//  }
//  if (deletenumber < 1 || deletenumber > oldlines.length){
//    return
//  }
// // get rid of the desired line
// oldlines.splice(deletenumber-1,1)
// oldwidths.splice(deletenumber-1,1)
// oldcolors.splice(deletenumber-1,1)  
// // Clear <canvas>
// gl.clear(gl.COLOR_BUFFER_BIT);
//  
// 
// // draw all old lines (if they exist) 
// if (oldlines.length > 0){
//   for (var i =0 ; i < oldlines.length ; i++){       
//     draw (gl,canvas,a_Position,oldlines[i],oldwidths[i],oldcolors[i])
//   } 
// }
// var vertices = new Float32Array(g_points)
// // draw currently working line with points
// const colors = []
// colors.push(Rcolor)
// colors.push(Gcolor)
// colors.push(Bcolor)
// colors.push(Acolor)
// draw (gl,canvas,a_Position,vertices,width,colors)
}

function updateColor (gl,a_Position,R,G,B,A){
  gl.deleteShader(FSHADER_SOURCE)
  var FSHADER_SOURCE = 
  'void main() {\n' +
  '  gl_FragColor = vec4('+R+ ', '+ G + ', ' + B + ', ' + A + ');\n' +
  '}\n';
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
}

// INPUT : x1,x2 y1,y2 : coordinates of line segment to draw on
// r: value of radius
// colors : array [R,G,B,A] of colors
function drawcylinder(gl,canvas,a_Position,r,x1,y1,x2,y2,colors){
  // multiply degrees by convert to get value in radians
  const convert = pi/180
  const test = Math.floor(360/sides)
  // gets x,y for circle
  for (var i=0 ; i <=360 ; i+=test){ 
    cylinder_points.push(Math.cos(convert*i) * r + x1)
    cylinder_points.push(Math.sin(convert*i) * r + y1)
    cylinder_points.push(0)
  } 
  for (var i=0 ; i <=360 ; i+=test){ 
    cylinder_points.push(Math.cos(convert*i) * r + x2)
    cylinder_points.push(Math.sin(convert*i) * r + y2)
    cylinder_points.push(0)
  } 
  var vertices = new Float32Array(cylinder_points)
  // draw currently working line with points
 drawGeneralizedCylinder (gl,canvas,a_Position,vertices,width,colors)
}

function changeSides(ev, gl, canvas, sliderSides,  a_Position){
  sides = sliderSides.value
}

function changeRadius(ev, gl, canvas, sliderRaidus,  a_Position){
  radius = sliderRadius.value
}
