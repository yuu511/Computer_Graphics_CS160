// lab1.js 
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

console.log(FSHADER_SOURCE)

var previousX = null
var previousY = null 
var g_points = [] // The array for the position of a mouse press
var oldlines = [] // all previous completed lines
var width = 1 //current working width
var oldwidths = [] //all old widths
var Rcolor = 1
var Gcolor = 0
var Bcolor = 0
var Acolor = 1

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  var sliderSize = document.getElementById('newslider')
  var sliderR = document.getElementById('sliderR')
  var sliderG = document.getElementById('sliderG')
  var sliderB = document.getElementById('sliderB')
  var sliderA = document.getElementById('sliderA')
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

  // // Get the storage location of a_Position
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
  sliderSize.oninput = function(ev){ slide(ev, gl, canvas, sliderSize,  a_Position); };
  sliderR.oninput = function(ev){ Rslider(ev, gl, canvas, sliderR,  a_Position); };
  sliderG.oninput = function(ev){ Gslider(ev, gl, canvas, sliderG,  a_Position); };
  sliderB.oninput = function(ev){ Bslider(ev, gl, canvas, sliderB,  a_Position); };
  sliderA.oninput = function(ev){ Aslider(ev, gl, canvas, sliderA,  a_Position); };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
 
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT); 
}

function leftclick(ev, gl, canvas, a_Position) {  
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
 
  // draw all old lines (if they exist) 
  if (oldlines.length > 0){
    for (var i =0 ; i < oldlines.length ; i++){       
      draw (gl,canvas,a_Position,oldlines[i],oldwidths[i])
    } 
  }

 var vertices = new Float32Array(g_points)
 // draw currently working line with points
 draw (gl,canvas,a_Position,vertices,width)
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
  
  // draw all old lines (if they exist) 
  if (oldlines.length > 0){
    for (var i =0 ; i < oldlines.length ; i++){       
      draw (gl,canvas,a_Position,oldlines[i],oldwidths[i])
    } 
  }
 
 //draw currently working line
 var vertices = new Float32Array(g_points)
 draw (gl,canvas,a_Position,vertices,width)
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
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  
 
  // draw all old lines (if they exist) 
  if (oldlines.length > 0){
    for (var i =0 ; i < oldlines.length ; i++){       
      draw (gl,canvas,a_Position,oldlines[i],oldwidths[i])
    } 
  }
 var vertices = new Float32Array(g_points)
 // draw currently working line with points
 draw (gl,canvas,a_Position,vertices,width)
  console.log ("You have finished drawing \n") 
  console.log ("Your finished polyline :")
  for(var i = 0; i < g_points.length; i += 2) {
    console.log ("("+ g_points[i] + "," + g_points[i+1] + ")")
  }
  console .log ("(" + x + "," + y + ")")
  console.log ("\n")
  previousX = null
  previousY = null
  g_points = []
}

// generic drawing function, will draw line with all vertices specified below.
function draw (gl,canvas,a_Position,vertices,linewidth){   
 gl.lineWidth(linewidth)
 var len = vertices.length;
 if (len === 0)
  return
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
  gl.enableVertexAttribArray(a_Position); //all old widths
  gl.drawArrays(gl.LINE_STRIP, 0, len/2);

  for(var i = 0; i < len; i += 2) {
    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, vertices[i], vertices[i+1], 0.0);

    // Draw
    gl.drawArrays(gl.POINTS, 0, len/2);
  }
}

function slide(ev, gl, canvas, sliderSize, a_Position) { 
  width=sliderSize.value
}

function Rslider(ev, gl, canvas, sliderR, a_Position) { 
  Rcolor=sliderR.value
  updateColor (gl,Rcolor,Gcolor,Bcolor,Acolor)
}

function Gslider(ev, gl, canvas, sliderG, a_Position) { 
  Gcolor=sliderG.value
  updateColor (gl,Rcolor,Gcolor,Bcolor,Acolor)
}

function Bslider(ev, gl, canvas, sliderB, a_Position) { 
  Bcolor=sliderB.value
  updateColor (gl,Rcolor,Gcolor,Bcolor,Acolor)
}

function Aslider(ev, gl, canvas, sliderA, a_Position) { 
  Acolor=sliderA.value
  updateColor (gl,Rcolor,Gcolor,Bcolor,Acolor)
}

function updateColor (gl,R,G,B,A){
  FSHADER_SOURCE = 
  'void main() {\n' +
  '  gl_FragColor = vec4('+R+ ', '+ G + ', ' + B + ', ' + A + ');\n' +
  '}\n';
  console.log (FSHADER_SOURCE)
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
}
