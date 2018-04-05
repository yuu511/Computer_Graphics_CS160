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

var previousX = null
var previousY = null 
var g_points = [] // The array for the position of a mouse press
var oldlines = [] // all previous completed lines
var width = 10.0 //current working width
var oldwidths = [] //all old widths
var Rcolor = 1
var Gcolor = 0
var Bcolor = 0
var Acolor = 1
var oldcolors = [] // array of arrays. X = one entry. X[1]=R X[2] = G X[3] = B X[4] = A
var formvalue = -1 

function main() {
  // Retrieve <canvas> element
  const canvas = document.getElementById('webgl');
  const sliderSize = document.getElementById('newslider')
  const sliderR = document.getElementById('sliderR')
  const sliderG = document.getElementById('sliderG')
  const sliderB = document.getElementById('sliderB')
  const sliderA = document.getElementById('sliderA')
  const textbox = document.getElementById('textbox')
  const button = document.getElementById('button')

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
  button.onclick = function(ev){ keypress(ev, gl, canvas, textbox,  a_Position); };

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
      draw (gl,canvas,a_Position,oldlines[i],oldwidths[i],oldcolors[i])
    } 
  }

 var vertices = new Float32Array(g_points)
 // draw currently working line with points
 const colors = []
 colors.push(Rcolor)
 colors.push(Gcolor)
 colors.push(Bcolor)
 colors.push(Acolor)
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
  
  // draw all old lines (if they exist) 
  if (oldlines.length > 0){
    for (var i =0 ; i < oldlines.length ; i++){       
      draw (gl,canvas,a_Position,oldlines[i],oldwidths[i],oldcolors[i])
    } 
  }
 
 //draw currently working line
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
  const colors = []
  colors.push(Rcolor)
  colors.push(Gcolor)
  colors.push(Bcolor)
  colors.push(Acolor)
  oldcolors.push(colors)

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  
 
  // draw all old lines (if they exist) 
  if (oldlines.length > 0){
    for (var i =0 ; i < oldlines.length ; i++){       
      draw (gl,canvas,a_Position,oldlines[i],oldwidths[i],oldcolors[i])
    } 
  }
 var vertices = new Float32Array(g_points)
 // draw currently working line with points
 draw (gl,canvas,a_Position,vertices,width,colors)
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
function draw (gl,canvas,a_Position,vertices,pointwidth,colors){   
 updateColor (gl,a_Position,pointwidth,colors[0],colors[1],colors[2],colors[3])
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

function keypress(ev, gl, canvas, textbox, a_Position) { 
  let  deletenumber = parseInt(textbox.value)
  if (isNaN(deletenumber)){
   return
  }
  //  edge case where we have someone attempting to delete a line that you are currently drawing
  if (deletenumber==oldlines.length+1 && (previousX!==null || previousY!==null)){
    if (oldlines.length > 0){
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (var i =0 ; i < oldlines.length ; i++){       
        draw (gl,canvas,a_Position,oldlines[i],oldwidths[i],oldcolors[i])
      } 
      previousX = null
      previousY = null
      g_points = []
    }
   return
  }
  if (deletenumber < 1 || deletenumber > oldlines.length){
    return
  }
 // get rid of the desired line
 oldlines.splice(deletenumber-1,1)
 oldwidths.splice(deletenumber-1,1)
 oldcolors.splice(deletenumber-1,1)  
 // Clear <canvas>
 gl.clear(gl.COLOR_BUFFER_BIT);
  
 
 // draw all old lines (if they exist) 
 if (oldlines.length > 0){
   for (var i =0 ; i < oldlines.length ; i++){       
     draw (gl,canvas,a_Position,oldlines[i],oldwidths[i],oldcolors[i])
   } 
 }
 var vertices = new Float32Array(g_points)
 // draw currently working line with points
 const colors = []
 colors.push(Rcolor)
 colors.push(Gcolor)
 colors.push(Bcolor)
 colors.push(Acolor)
 draw (gl,canvas,a_Position,vertices,width,colors)
}

function updateColor (gl,a_Position,pointwidth,R,G,B,A){
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


