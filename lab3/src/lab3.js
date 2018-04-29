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

// refrence for the rubber band line
let previousX = null
let previousY = null 

// g_points = current working line, oldlines = all finished lines (an array of arrays)
let g_points = [] // The array for the position of a mouse press
let oldlines = [] // all previous completed lines

// legacy lab1 code (deprecated) 
// width = current width, oldwidths = all old widths
let width = 1.0 //current working width (thickness of line)
let oldwidths = [] //all old widths

// (x)Color = current color setting, oldcolors = all old colors (an array of arrays)
let Rcolor = 0
let Gcolor = 1
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
let individualsides = []
let cylindersides = []

let radius = 0.16
let radii = []
let cylinderradii = []

let previousFace = []

let cumulativeheight = 0

checkBox = document.getElementById('surfacenormalcheckbox')

function main() {
  // Retrieve <canvas> element
  const canvas = document.getElementById('webgl');


//  const sliderSize = document.getElementById('newslider')
  const sliderR = document.getElementById('sliderR')
  const sliderG = document.getElementById('sliderG')
  const sliderB = document.getElementById('sliderB')
  const sliderA = document.getElementById('sliderA')
  const deleteL = document.getElementById('deleteL')
  const deleteC = document.getElementById('deleteC')
  const buttonDelete = document.getElementById('buttonDelete')
  const sliderSides = document.getElementById('sliderSides')
  const sliderRadius = document.getElementById('sliderRadius')
  const saveSOR = document.getElementById('saveSOR')
  const extractSOR = document.getElementById('extractSOR')
  const surfaceCheckbox = document.getElementById('surfacenormalcheckbox')
  

  setupIOSOR("fileinput")

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
  checkBox=surfaceCheckbox
  checkBox.onclick = function (ev){checkBoxClick(ev, gl, canvas, a_Position)}

//  sliderSize.oninput = function(ev){ pointThick(ev, gl, canvas, sliderSize,  a_Position); };
//  sliderR.oninput = function(ev){ Rslider(ev, gl, canvas, sliderR,  a_Position); };
//  sliderG.oninput = function(ev){ Gslider(ev, gl, canvas, sliderG,  a_Position); };
//  sliderB.oninput = function(ev){ Bslider(ev, gl, canvas, sliderB,  a_Position); };
//  sliderA.oninput = function(ev){ Aslider(ev, gl, canvas, sliderA,  a_Position); };
//  buttonDelete.onclick = function(ev){ deleteCylinder(ev, gl, canvas, deleteL,deleteC,  a_Position); };
//  sliderSides.oninput = function(ev){ changeSides(ev, gl, canvas, sliderSides,  a_Position); };
//  sliderRadius.oninput = function(ev){ changeRadius(ev, gl, canvas, sliderRadius,  a_Position); };
  saveSOR.onclick = function(ev){saveCanvas(ev); };
  extractSOR.onclick = function(ev){ updateScreen(ev, gl, canvas, a_Position); };

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
 individualsides.push(sides)
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
  cylindersides.push(individualsides)
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);


  // draw all finished cylinder, clear arrays for next line segment 
  previousX = null  
  previousY = null
  oldcolors = []
  g_points = []
  radii=[]
  individualsides=[]
  drawAllCylinders(gl,canvas,a_Position)
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

// lab1 junk, only used to draw polyline
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

// simple function to draw all cylinders based on all established line segments
function drawAllCylinders(gl,canvas,a_Position){
  // draw all finished cylinder 
  for (var i =0 ; i < oldlines.length ; i++){       
    previousFace = []
    if (oldlines[i].length >= 4){
     var loop = (((oldlines[i].length/2)-1)*2)
     for (var j =0; j < loop;j+=2){    
      drawcylinder(gl,canvas,a_Position,cylinderradii[i][j/2],cylindersides[i][j/2],oldlines[i][j],oldlines[i][j+1],oldlines[i][j+2],oldlines[i][j+3],cylindercolors[i][j/2])
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

function deleteCylinder(ev, gl, canvas, deleteL,deleteC, a_Position) { 
  let  deleteLine = parseInt(deleteL.value)
  let  deleteCylinder = parseInt(deleteC.value) 
  if (isNaN(deleteLine)||isNaN(deleteCylinder))
   return
  if (deleteLine < 1 || deleteCylinder < 1 || deleteLine > oldlines.length || oldlines.length < 1)
   return  
  if (oldlines[deleteLine-1] === undefined || oldlines[deleteLine-1][deleteCylinder-1] === undefined)
   return 
  if ((oldlines[deleteLine-1].length-2)/2 < deleteCylinder)
   return
  var temp = Array.from(oldlines[deleteLine-1])
  temp.splice(((2*deleteCylinder)-2),2)
  
  if (temp === undefined)
    return
  if (temp.length == 2){
    oldlines.splice(deleteLine-1,1) 
    cylindercolors.splice(deleteLine-1,1)
    cylinderradii.splice(deleteLine-1,1)
    cylindersides.splice(deleteLine-1,1)
    previousX = null  
    previousY = null
    oldcolors = []
    g_points = []
    radii=[]
    individualsides=[]
  }
  if (temp.length > 2){
    oldlines[deleteLine-1] = new Float32Array(temp) 
  }
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);  
  previousFace = []
  drawAllCylinders(gl,canvas,a_Position)
}

function updateColor (gl,a_Position,R,G,B,A){
  gl.deleteShader(FSHADER_SOURCE)
  if ( isNaN(R) || isNaN(G) || isNaN(B) || isNaN(A)){
    Rcolor = 1
    Gcolor = 0
    Bcolor = 0
    Acolor = 1
    R = 1
    G = 0
    B = 0
    A = 1
  }
  
  var FSHADER_SOURCE = 
  'void main() {\n' +
  '  gl_FragColor = vec4('+R+ ', '+ G + ', ' + B + ', ' + A + ');\n' +
  '}\n';
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
}

// Draws Cylinders, surface normal lines , and CAPs between cylinders!

// INPUT : x1,x2 y1,y2 : coordinates of line segment to draw on
// r: value of radius
// s: number of sides
// colors : array [R,G,B,A] of colors
function drawcylinder(gl,canvas,a_Position,r,s,x1,y1,x2,y2,colors){

  //  ** DRAW CYLINDERS **
  //

  // multiply degrees by convert to get value in radians  
  // a circle is 360 degrees, rotate by (360 / s) degrees for every side, where n is number of sides!
  const convert = Math.PI/180 
  const numsides = 360/s

  // get the angle that the line segment forms
  const deltaX = x2-x1
  const deltaY = y2-y1 
  let degreeToRotate = Math.atan2(deltaY,deltaX)
  degreeToRotate = ((2 * Math.PI) - degreeToRotate)
  
  // first we'll draw a circle by rotating around the x axis, then use a transformation matrix to rotate it
  // by the angle we found previously so the circle fits around the axis formed by the line segment
  let unrotated = []

  for (var i=0 ; i <=360; i+=numsides){ 
    unrotated.push(0)
    unrotated.push((Math.cos(convert*i))*r)
    unrotated.push(Math.sin(convert*i)*r)
  } 
  for (var i=0 ; i <=360; i+=numsides){ 
    unrotated.push(0)
    unrotated.push((Math.cos(convert*i))*r)
    unrotated.push(Math.sin(convert*i)*r)
  } 
  var vertices = new Float32Array(cylinder_points) 
  // OUR ROTATIONAL MATRIX (Rotating around the Z axis):
  // cos sin (0)
  // -sin cos (0)
  // 0    0    1 
 
  // first circle
  for (var i = 0 ; i < unrotated.length/2 ; i+=3){
   cylinder_points.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +  x1) 
   cylinder_points.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) + y1)
   cylinder_points.push(unrotated[i+2])
  }
  // second circle
  for (var i = unrotated.length/2; i < unrotated.length; i+=3){
   cylinder_points.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +x2) 
   cylinder_points.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) +y2)
   cylinder_points.push(unrotated[i+2])
  }
  var vertices = new Float32Array(cylinder_points)
  updateColor (gl,a_Position,colors[0],colors[1],colors[2],colors[3])
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
   // cool traiangles
  for (var i=0 ; i < s; i++){
    indices.push(i)
    indices.push(i+1) 
    indices.push(len+i)
    indices.push(i)

    indices.push(len+i)
    indices.push(len+i+1) 
    indices.push(i)
    indices.push(len+i)

    indices.push(len+i)
    indices.push(len+i+1) 
    indices.push(i+1)
    indices.push(len+i)
  }
  indices = new Int16Array(indices)
  setIndexBuffer(gl,indices)
  // draw cylinder 
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);    

  // ** DRAWING NORMAL LINES **
  //

  // draw normals (if applicable) , one for every face s  
  if (checkBox.checked){
   // draw for the side faces
   for (var i = 0 ; i < s ; i++){
     // Find two lines (QR,QS) formed by 3 points (Q,R,S) on the surface 
     // In this case we'll use the vertices
     let Q = []
     let R = []
     let S = []
     let QR = []
     let QS = []
     let cross = []
     let normalverts = []
     let trianglecenter = []

     Q.push(cylinder_points[3*i])
     Q.push(cylinder_points[3*i+1])
     Q.push(cylinder_points[3*i+2])

     R.push(cylinder_points[3*i+3])
     R.push(cylinder_points[3*i+4])
     R.push(cylinder_points[3*i+5])

     S.push(cylinder_points[3*i+(unrotated.length/2)+3])
     S.push(cylinder_points[3*i+(unrotated.length/2)+4])
     S.push(cylinder_points[3*i+(unrotated.length/2)+5]) 
      
     QR.push(R[0]-Q[0]) 
     QR.push(R[1]-Q[1]) 
     QR.push(R[2]-Q[2])

     QS.push(S[0]-Q[0]) 
     QS.push(S[1]-Q[1]) 
     QS.push(S[2]-Q[2])

     // the surface normal vector is calculated by QR x QS which is perpendicular to the plane
     // use normalize to find the unit vector
     cross = normalize(findCross(QR,QS))

     // find triangle center of QRS
     trianglecenter.push ((Q[0]+R[0]+S[0])/3)
     trianglecenter.push ((Q[1]+R[1]+S[1])/3)
     trianglecenter.push ((Q[2]+R[2]+S[2])/3)

     // Add the surface normal vector
     // adding 0.008 for visibility 
     normalverts.push (trianglecenter[0] +  (cross[0]*0.07) + 0.008)
     normalverts.push (trianglecenter[1] +  (cross[1]*0.07) + 0.008)
     normalverts.push (trianglecenter[2] +  (cross[2]*0.07) + 0.008)
    

     normalverts.push (trianglecenter[0])
     normalverts.push (trianglecenter[1])
     normalverts.push (trianglecenter[2])
      
     normalverts = new Float32Array(normalverts)
     // draw currently working line with points
     const colors = []
     colors.push(1)
     colors.push(0)
     colors.push(0)
     colors.push(1)
     updateColor (gl,a_Position,colors[0],colors[1],colors[2],colors[3])
     let vertlen = normalverts.length;
     if (vertlen === 0)
      return
    
      var success = initVertexBuffer(gl)
      if (!success) {
    	console.log('Failed to initialize buffers.')
    	return
      }
      setVertexBuffer (gl,normalverts)
      // Assign the buffer object to a_Position variable
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    
      // Enable the assignment to a_Position variable
      gl.enableVertexAttribArray(a_Position);
      gl.drawArrays(gl.LINE_STRIP, 0, vertlen/3); 
   } 
    // draw normals for the base circles
    // base 1
    for (var i = 0 ; i < s ; i++){
      // Find two lines (QR,QS) formed by 3 points (Q,R,S) on the surface 
      // In this case we'll use the vertices
      let Q = []
      let R = []
      let S = []
      let QR = []
      let QS = []
      let cross = []
      let normalverts = []
      let trianglecenter = []

      Q.push(cylinder_points[3*i])
      Q.push(cylinder_points[3*i+1])
      Q.push(cylinder_points[3*i+2])

      R.push(cylinder_points[3*i+3])
      R.push(cylinder_points[3*i+4])
      R.push(cylinder_points[3*i+5])

      S.push(x1)
      S.push(y1)
      S.push(0)
       
      QR.push(R[0]-Q[0]) 
      QR.push(R[1]-Q[1]) 
      QR.push(R[2]-Q[2])

      QS.push(S[0]-Q[0]) 
      QS.push(S[1]-Q[1]) 
      QS.push(S[2]-Q[2])

      // the surface normal vector is calculated by QR x QS which is perpendicular to the plane
      // use normalize to find the unit vector
      cross = normalize(findCross(QR,QS))

      // find triangle center of QRS
      trianglecenter.push ((Q[0]+R[0]+S[0])/3)
      trianglecenter.push ((Q[1]+R[1]+S[1])/3)
      trianglecenter.push ((Q[2]+R[2]+S[2])/3)

      // Add the surface normal vector
      // adding 0.008 for visibility 
      normalverts.push (trianglecenter[0] -  (cross[0]*0.07))
      normalverts.push (trianglecenter[1] -  (cross[1]*0.07))
      normalverts.push (trianglecenter[2] -  (cross[2]*0.07))
     

      normalverts.push (trianglecenter[0])
      normalverts.push (trianglecenter[1])
      normalverts.push (trianglecenter[2])
      normalverts = new Float32Array(normalverts)
      // draw currently working line with points
      const colors = []
      colors.push(1)
      colors.push(0)
      colors.push(0)
      colors.push(1)
      updateColor (gl,a_Position,colors[0],colors[1],colors[2],colors[3])
      let vertlen = normalverts.length;
      if (vertlen === 0)
       return
     
       var success = initVertexBuffer(gl)
       if (!success) {
     	console.log('Failed to initialize buffers.')
     	return
       }
       setVertexBuffer (gl,normalverts)
       // Assign the buffer object to a_Position variable
       gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
     
       // Enable the assignment to a_Position variable
       gl.enableVertexAttribArray(a_Position);
       gl.drawArrays(gl.LINE_STRIP, 0, vertlen/3); 
    } 
    // draw normals for the base circles
    // base 2
    for (var i = 0 ; i < s ; i++){
      // Find two lines (QR,QS) formed by 3 points (Q,R,S) on the surface 
      // In this case we'll use the vertices
      let Q = []
      let R = []
      let S = []
      let QR = []
      let QS = []
      let cross = []
      let normalverts = []
      let trianglecenter = []

      Q.push(cylinder_points[3*i+(unrotated.length/2)])
      Q.push(cylinder_points[3*i+(unrotated.length/2)+1])
      Q.push(cylinder_points[3*i+(unrotated.length/2)+2])

      R.push(cylinder_points[3*i+(unrotated.length/2)+3])
      R.push(cylinder_points[3*i+(unrotated.length/2)+4])
      R.push(cylinder_points[3*i+(unrotated.length/2)+5])

      S.push(x2)
      S.push(y2)
      S.push(0)
       
      QR.push(R[0]-Q[0]) 
      QR.push(R[1]-Q[1]) 
      QR.push(R[2]-Q[2])

      QS.push(S[0]-Q[0]) 
      QS.push(S[1]-Q[1]) 
      QS.push(S[2]-Q[2])

      // the surface normal vector is calculated by QR x QS which is perpendicular to the plane
      // use normalize to find the unit vector
      cross = normalize(findCross(QR,QS))

      // find triangle center of QRS
      trianglecenter.push ((Q[0]+R[0]+S[0])/3)
      trianglecenter.push ((Q[1]+R[1]+S[1])/3)
      trianglecenter.push ((Q[2]+R[2]+S[2])/3)

      // Add the surface normal vector
      // adding 0.008 for visibility 
      normalverts.push (trianglecenter[0] +  (cross[0]*0.07))
      normalverts.push (trianglecenter[1] +  (cross[1]*0.07))
      normalverts.push (trianglecenter[2] +  (cross[2]*0.07))
     

      normalverts.push (trianglecenter[0])
      normalverts.push (trianglecenter[1])
      normalverts.push (trianglecenter[2])
       
      normalverts = new Float32Array(normalverts)
      // draw currently working line with points
      const colors = []
      colors.push(1)
      colors.push(0)
      colors.push(0)
      colors.push(1)
      updateColor (gl,a_Position,colors[0],colors[1],colors[2],colors[3])
      let vertlen = normalverts.length;
      if (vertlen === 0)
       return
     
       var success = initVertexBuffer(gl)
       if (!success) {
     	console.log('Failed to initialize buffers.')
     	return
       }
       setVertexBuffer (gl,normalverts)
       // Assign the buffer object to a_Position variable
       gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
     
       // Enable the assignment to a_Position variable
       gl.enableVertexAttribArray(a_Position);
       gl.drawArrays(gl.LINE_STRIP, 0, vertlen/3); 
    } 
  }

  cylinder_points = []

  // ** DRAW CAP **
  // (FOR SMOOTH EDGES) 

  let cap_points = []
  updateColor (gl,a_Position,colors[0],colors[1],colors[2],colors[3])
  if (previousFace.length < 1){
    for (var i = unrotated.length/2; i < unrotated.length; i+=3){
      previousFace.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +x2) 
      previousFace.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) +y2)
      previousFace.push(unrotated[i+2])
    }
    return
  } 
  for (var j=0 ; j < previousFace.length ;j++){
    cap_points.push(previousFace[j])    
  }
  previousFace = []
  for (var i = 0 ; i < unrotated.length/2 ; i+=3){
   cap_points.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +  x1) 
   cap_points.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) + y1)
   cap_points.push(unrotated[i+2])
   previousFace.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +x2) 
   previousFace.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) +y2)
   previousFace.push(unrotated[i+2])
  }
  var capvertices = new Float32Array(cap_points)
  // initialize buffers
  var success = initVertexBuffer(gl);
  success = success && initIndexBuffer(gl);
  success = success && initAttributes(gl);  
  if (!success) {
      console.log('Failed to initialize buffers.');
      return;
  }
  // # of vertices on base 
  let caplen = capvertices.length/6;
  if (caplen === 0)
   return
  setVertexBuffer(gl,capvertices)
  // reusing old indices because they connected the same 
  setIndexBuffer(gl,indices)
  // draw cylinder 
  gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0);   
  cap_points= []
}

// finds cross product between 2 vectors
// input :  2 length 3 arrays 
function findCross(QR,QS){
     let cross = []
     // the surface normal vector is calculated by QR x QS which is perpendicular to the plane
     cross.push((QR[1]*QS[2]) - (QR[2]*QS[1])) 
     cross.push((QR[2]*QS[0]) - (QR[0]*QS[2]))
     cross.push((QR[0]*QS[1]) - (QR[1]*QS[0]))
     return cross
}

// normalies a vector
// input : 1 length 3 array
function normalize(P){
  let normalized = []
  let magnitude = (Math.sqrt ((P[0]*P[0])+(P[1]*P[1])+(P[2]*P[2])))
  normalized.push (P[0]/magnitude)
  normalized.push (P[1]/magnitude)
  normalized.push (P[2]/magnitude)
  return normalized
}


function changeSides(ev, gl, canvas, sliderSides,  a_Position){
  sides = sliderSides.value
}

function changeRadius(ev, gl, canvas, sliderRaidus,  a_Position){
  radius = sliderRadius.value
}

// saves polyline displayed on canvas to file
function saveCanvas(ev) {
    console.log("test")
    var sor = new SOR();
    sor.objName = "model";
    sor.vertices = oldlines;
    sor.indexes = []
    for (let i=0;i<oldlines.length;i++){
      for (let j=0;j<oldlines[i].length;j++){
        sor.indexes.push(oldlines[i][j])
      }
    }
    saveFile(sor);
}

function updateScreen(ev, gl, canvas, a_Position){
  var extract = readFile() 
  hardReset()
  var counter = 0 
  for (var a =0 ; a < extract.vertices.length;a++){
    oldlines[a]=[]
  }
  for(var i=0; i< extract.indexes.length;i++){ 
      for (var j=0 ; j< extract.vertices.length;j++){ 
        if (extract.indexes[i]==extract.vertices[j]){
          counter++ 
        }
      }
      oldlines[counter-1].push(extract.indexes[i])
      console.log(oldlines)
  }
  for (var j=0; j< extract.vertices.length;j++){
    oldlines[j]=new Float32Array(oldlines[j])
  }
  console.log(oldlines)
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  // draw all finished cylinder 
  for (var i =0 ; i < oldlines.length ; i++){       
    previousFace = []
    if (oldlines[i].length >= 4){
     var loop = (((oldlines[i].length/2)-1)*2)
     for (var j =0; j < loop;j+=2){    
      drawcylinder(gl,canvas,a_Position,radius,sides,oldlines[i][j],oldlines[i][j+1],oldlines[i][j+2],oldlines[i][j+3],defaultcolor)
     }
    }
  }  
  hardReset()
}

// restores all defaults and empties placeholder variables
function hardReset(){
  previousX = null
  previousY = null 
  g_points = [] // The array for the position of a mouse press
  oldlines = [] // all previous completed lines
  Rcolor = 1
  Gcolor = 0
  Bcolor = 0
  Acolor = 1
  oldcolors = [] // array of colors in each individual cylinder 
  cylindercolors = [] //array of oldcolors 
  const defaultcolor = []
  defaultcolor.push(Rcolor)
  defaultcolor.push(Gcolor)
  defaultcolor.push(Bcolor)
  defaultcolor.push(Acolor)
  formvalue = -1 
  sizeofpoint = 10.0 
  cylinder_points = []
  sides = 10
  individualsides = []
  cylindersides = []
  radius = 0.25
  radii = []
  cylinderradii = []
  previousFace = []
  cumulativeheight = 0
}

function checkBoxClick(ev, gl, canvas, a_Position){
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
 
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT); 
  // draw all finished cylinder 
  drawAllCylinders(gl,canvas,a_Position)
}
