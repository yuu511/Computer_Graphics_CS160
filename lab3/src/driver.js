// Example showing how you can convert a wireframe to a skinned model with triangles

var FSIZE = 4; // size of a vertex coordinate (32-bit float)
var VSHADER_SOURCE = null; // vertex shader program
var FSHADER_SOURCE = null; // fragment shader program

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
const defaultcolor = []
defaultcolor.push(Rcolor)
defaultcolor.push(Gcolor)
defaultcolor.push(Bcolor)
defaultcolor.push(Acolor)

let sizeofpoint = 10.0 

// cylinder_points = currently drawing cylinder points
// sides = number of size the cylinder will have
let cylinder_points = []

let sides = 10
let individualsides = []
let cylindersides = []

let radius = 0.20 
let radii = []
let cylinderradii = []

let previousFace = []

let cumulativeheight = 0


//lab 3 stuff
let checkBox = document.getElementById('surfacenormalcheckbox')
let whiteLightBox = document.getElementById('whitebox')
let redLightBox = document.getElementById('redbox')
let normals = []
let light1C = []
let light1V = []
let light2C = []
let light2V = []

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
    // load shader files
    loadFile("shader.vert", function(shader_src) { setShader(gl, gl.VERTEX_SHADER, shader_src); });
    loadFile("shader.frag", function(shader_src) { setShader(gl, gl.FRAGMENT_SHADER, shader_src); });
}

// set appropriate shader and start if both are loaded
function setShader(gl, shader, shader_src) {
    if (shader == gl.VERTEX_SHADER)
        VSHADER_SOURCE = shader_src;
    if (shader == gl.FRAGMENT_SHADER)
        FSHADER_SOURCE = shader_src;
    if (VSHADER_SOURCE && FSHADER_SOURCE)
        start(gl);
}

// called when shaders are done loading
function start(gl) {
    // retrieve <canvas> element
    var canvas = document.getElementById('webgl');
    // initialize shaders
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
    const surfaceCheckbox = document.getElementById('surfacenormalcheckbox')
    checkBox=surfaceCheckbox
    const shiftX = document.getElementById('shiftX')
    const moveLight = document.getElementById('moveLight') 
    const rotateAlongY = document.getElementById('rotateAlongY') 
    const whitebox = document.getElementById('whitebox')
    whiteLightBox = whitebox
    const redbox = document.getElementById('redbox')
    redLightBox = redbox
    surfaceCheckbox.onclick = function (ev){checkBoxClick(ev, gl, canvas, a_Position)}
    whitebox.onclick = function (ev){checkBoxClick(ev, gl, canvas, a_Position)}
    redbox.onclick = function (ev){checkBoxClick(ev, gl, canvas, a_Position)}
    const da10 = document.getElementById('da10')
    // initialize buffers
    var success = initVertexBuffer(gl);
    success = success && initIndexBuffer(gl);
    success = success && initAttributes(gl);  
    if (!success) {
        console.log('Failed to initialize buffers.');
        return;
    }

    canvas.onmousedown = function(ev){ leftclick(ev, gl, canvas, a_Position); };
    canvas.onmousemove = function(ev){ move(ev, gl, canvas, a_Position); };
    canvas.oncontextmenu = function(ev){ rightclick(ev, gl, canvas, a_Position); };
    shiftX.onclick = function(ev){ shift(ev, gl, canvas, a_Position); };
    moveLight.onclick = function(ev){ mvlight(ev, gl, canvas, a_Position); };
    rotateAlongY.onclick = function(ev){ rotateY(ev, gl, canvas, a_Position); };
    da10.onclick = function(ev){ max300(ev, gl, canvas, a_Position,0); };
    // specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);
    // clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (var i= 0 ; i<4 ; i++){
     light1C.push(1)
    }
    for (var i= 0 ; i<3 ; i++){
     light1V.push(1)
     light2V.push(1)
    }
   light2C.push(1)
   light2C.push(0)
   light2C.push(0)
   light2C.push(1)
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
    // assign buffers and enable assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Position < 0) {
        console.log("failed to get storage location of a_Position");
        return false;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 7, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, FSIZE * 7, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);
    return true;
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
  draw (gl,canvas,a_Position,vertices,width)
}

function rightclick (ev,gl,canvas,a_Position){   
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  console.log(x + " " + y + " right click\n")
  var archive = new Float32Array(g_points)
  oldlines.push (archive)

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);


  // draw all finished cylinder, clear arrays for next line segment 
  previousX = null  
  previousY = null
  g_points = []
  drawAllCylinders(gl,canvas,a_Position)
}

function move (ev,gl,canvas,a_Position){   
  let elastic = []
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
 draw (gl,canvas,a_Position,g_points,width) 
 elastic.push(previousX)
 elastic.push(previousY)
 elastic.push(x)
 elastic.push(y)
 draw (gl,canvas,a_Position,elastic,width) 
}

// lab1 junk, only used to draw polyline
// generic drawing function, will draw line with all vertices specified below.
function draw (gl,canvas,a_Position,vertices,linewidth){   
   let vert = []     
   let ind = []
   for (var i =0; i<vertices.length;i+=2){
    vert.push(vertices[i]); 
    vert.push(vertices[i+1]); 
    vert.push(0);
    vert.push(Rcolor);
    vert.push(Gcolor);
    vert.push(Bcolor);
    vert.push(Acolor);
    ind.push(i/2)
  }
  // set buffers
  setVertexBuffer(gl, new Float32Array(vert));
  setIndexBuffer(gl, new Uint16Array(ind));
  // draw line
  gl.drawElements(gl.LINE_STRIP, ind.length, gl.UNSIGNED_SHORT, 0);    
}

// simple function to draw all cylinders based on all established line segments
function drawAllCylinders(gl,canvas,a_Position){
  // draw all finished cylinder 
  for (var i =0 ; i < oldlines.length ; i++){       
    previousFace = []
    let tempNormalholder = []
    if (oldlines[i].length >= 4){
     var loop = (((oldlines[i].length/2)-1)*2)
     for (var j =0; j < loop;j+=2){    
      drawcylinder(gl,canvas,a_Position,radius,sides,oldlines[i][j],oldlines[i][j+1],oldlines[i][j+2],oldlines[i][j+3])
     }
    }
  }  
}

// Draws Cylinders, CAPs between cylinders, and calls a function to draw surface normals if applicable!!

// INPUT : x1,x2 y1,y2 : coordinates of line segment to draw on
// r: value of radius
// s: number of sides
// colors : array [R,G,B,A] of colors
//drawcylinder(gl,canvas,a_Position,radius,sides,0,0,0,1)
function drawcylinder(gl,canvas,a_Position,r,s,x1,y1,x2,y2){

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
  degreeToRotate = ((2*Math.PI)-degreeToRotate)
  
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

  // OUR ROTATIONAL MATRIX (Rotating around the Z axis):
  // cos sin (0)
  // -sin cos (0)
  // 0    0    1 
 
  // first circle
  for (var i = 0 ; i < unrotated.length/2 ; i+=3){
   cylinder_points.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +  x1) 
   cylinder_points.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) + y1)
   cylinder_points.push(unrotated[i+2])
   cylinder_points.push(Rcolor)
   cylinder_points.push(Gcolor)
   cylinder_points.push(Bcolor)
   cylinder_points.push(Acolor)
  }
  // second circle
  for (var i = unrotated.length/2; i < unrotated.length; i+=3){
   cylinder_points.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +x2) 
   cylinder_points.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) +y2)
   cylinder_points.push(unrotated[i+2])
   cylinder_points.push(Rcolor)
   cylinder_points.push(Gcolor)
   cylinder_points.push(Bcolor)
   cylinder_points.push(Acolor)
  }
  let cylindernormals = calcnormals(gl,canvas,a_Position,r,s,x1,y1,x2,y2,cylinder_points) 
  // actually apply shading after calculating surface normals
  let colors = []
  // Lambertan Shading Ld = kD * I * Max(0,n dot vl)
  light1V = normalize(light1V)
  let currentred=0
  let currentgreen=0
  let currentblue=0
  // now both the light and surface normal are length 1 
  if (whiteLightBox.checked){
    for (var i=0 ; i < cylindernormals.length ; i++){
      let side = []
      let intensity = dot(cylindernormals[i],light1V)  
      intensity = Math.max(intensity,0)
      let red = currentred 
      let green = currentgreen + (light1C[1]*(intensity))
      let blue = currentblue 
      let alpha = 1
      side.push(red) 
      side.push(green)
      side.push(blue)
      side.push(alpha) 
      colors.push(side)
    }
  }
  if (redLightBox.checked){
    if (whiteLightBox.checked){
      for (var i =0 ; i < colors.length ; i++){
        let intensity = dot(cylindernormals[i],light2V)  
        colors[i][0]=colors[i][0]+ (intensity)
      }
    }
    else{
      for (var i=0 ; i < cylindernormals.length ; i++){
        let side = []
        let intensity = dot(cylindernormals[i],light2V)  
        intensity = Math.max(intensity,0)
        let red = currentred + intensity
        let green = currentgreen 
        let blue = currentblue 
        let alpha = 1
        side.push(red) 
        side.push(green)
        side.push(blue)
        side.push(alpha) 
        colors.push(side)
      }
   }
  }
  if (colors.length == 0){
    console.log ("Try Turning on a light!")
    return
  }
  colors.push(colors[0]) 
  cylinder_points = []
  // first circle
  for (var i = 0 ; i < unrotated.length/2 ; i+=3){
   cylinder_points.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +  x1) 
   cylinder_points.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) + y1)
   cylinder_points.push(unrotated[i+2])
   cylinder_points.push(colors[Math.floor(i/6)][0])
   cylinder_points.push(colors[Math.floor(i/6)][1])
   cylinder_points.push(colors[Math.floor(i/6)][2])
   cylinder_points.push(colors[Math.floor(i/6)][3])
  }
  // second circle
  for (var i = unrotated.length/2; i < unrotated.length; i+=3){
   cylinder_points.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +x2) 
   cylinder_points.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) +y2)
   cylinder_points.push(unrotated[i+2])
   cylinder_points.push(colors[Math.floor((i-(unrotated.length/2))/6)][0])
   cylinder_points.push(colors[Math.floor((i-(unrotated.length/2))/6)][1])
   cylinder_points.push(colors[Math.floor((i-(unrotated.length/2))/6)][2])
   cylinder_points.push(colors[Math.floor((i-(unrotated.length/2))/6)][3])
  }


  let len = cylinder_points.length/14;
  let indices = []
  // cool traiangles
  for (var i=0 ; i < s; i++){

    indices.push(i)
    indices.push(i+1) 
    indices.push(len+i)
    indices.push(i)

    indices.push(i+1)
    indices.push(len+i) 
    indices.push(len+i+1)
    indices.push(i+1)

    indices.push(len+i+1)
    indices.push(len+i) 
    indices.push(i+1)
    indices.push(len+i+1)

  }

  var vertices = new Float32Array(cylinder_points)
  setVertexBuffer(gl, new Float32Array(vertices))
  setIndexBuffer(gl, new Uint16Array(indices))
  // draw cylinder
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)    
  //draw normal vectors ! (if applicable)
  calcnormals(gl,canvas,a_Position,r,s,x1,y1,x2,y2,cylinder_points) 
  cylinder_points = []



  // ** DRAW CAP **
  // (FOR SMOOTH EDGES) 

//  let cap_points = []
//  if (previousFace.length < 1){
//    for (var i = unrotated.length/2; i < unrotated.length; i+=3){
//      previousFace.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +x2) 
//      previousFace.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) +y2)
//      previousFace.push(unrotated[i+2])
//      previousFace.push(colors[Math.floor(i/6)][0])
//      previousFace.push(colors[Math.floor(i/6)][1])
//      previousFace.push(colors[Math.floor(i/6)][2])
//      previousFace.push(colors[Math.floor(i/6)][3])
//    }
//    return
//  } 
//  for (var j=0 ; j < previousFace.length ;j++){
//    cap_points.push(previousFace[j])    
//  }
//  previousFace = []
//  for (var i = 0 ; i < unrotated.length/2 ; i+=3){
//   cap_points.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +  x1) 
//   cap_points.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) + y1)
//   cap_points.push(unrotated[i+2])
//   cap_points.push(colors[Math.floor(i/6)][0])
//   cap_points.push(colors[Math.floor(i/6)][1])
//   cap_points.push(colors[Math.floor(i/6)][2])
//   cap_points.push(colors[Math.floor(i/6)][3])
//   previousFace.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +x2) 
//   previousFace.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) +y2)
//   previousFace.push(unrotated[i+2])
//   cap_points.push(colors[Math.floor(i/6)][0])
//   cap_points.push(colors[Math.floor(i/6)][1])
//   cap_points.push(colors[Math.floor(i/6)][2])
//   cap_points.push(colors[Math.floor(i/6)][3])
//  }
//  var capvertices = new Float32Array(cap_points)
//  let caplen = capvertices.length/14;
//  if (caplen === 0)
//   return
//  setVertexBuffer(gl, new Float32Array(cap_points))
//  setIndexBuffer(gl, new Uint16Array(indices))
//  // draw caps 
//  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}


function calcnormals(gl,canvas,a_Position,r,s,x1,y1,x2,y2,cylinder_points){
 // draw for the side faces
 let cylindernormals = []
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
   let indices = []

   Q.push(cylinder_points[7*i])
   Q.push(cylinder_points[7*i+1])
   Q.push(cylinder_points[7*i+2])

   R.push(cylinder_points[7*i+7])
   R.push(cylinder_points[7*i+8])
   R.push(cylinder_points[7*i+9])

   S.push(cylinder_points[7*i+(cylinder_points.length/2)])
   S.push(cylinder_points[7*i+(cylinder_points.length/2)+1])
   S.push(cylinder_points[7*i+(cylinder_points.length/2)+2]) 
    
   QR.push(R[0]-Q[0]) 
   QR.push(R[1]-Q[1]) 
   QR.push(R[2]-Q[2])


   QS.push(S[0]-Q[0]) 
   QS.push(S[1]-Q[1]) 
   QS.push(S[2]-Q[2])

   // the surface normal vector is calculated by QR x QS which is perpendicular to the plane
   // use normalize to find the unit vector
   cross = normalize(findCross(QR,QS))
   cylindernormals.push(cross) 

   // find triangle center of QRS
   trianglecenter.push ((Q[0]+R[0]+S[0])/3)
   trianglecenter.push ((Q[1]+R[1]+S[1])/3)
   trianglecenter.push ((Q[2]+R[2]+S[2])/3)

   // Add the surface normal vector
   // adding 0.001 for visibility (some normals point directly at you)

   normalverts.push (trianglecenter[0])
   normalverts.push (trianglecenter[1])
   normalverts.push (trianglecenter[2])
   normalverts.push(1)
   normalverts.push(0)
   normalverts.push(0)
   normalverts.push(1)

   normalverts.push (trianglecenter[0] +  (cross[0]*0.05))
   normalverts.push (trianglecenter[1] +  (cross[1]*0.05))
   normalverts.push (trianglecenter[2] +  (cross[2]*0.05))
   normalverts.push(1)
   normalverts.push(0)
   normalverts.push(0)
   normalverts.push(1)
  
    
   indices.push(0)
   indices.push(1)

   setVertexBuffer(gl, new Float32Array(normalverts));
   setIndexBuffer(gl, new Uint16Array(indices))
   if (checkBox.checked){
     // draw normals (sides) 
     gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0)    
   }
 } 
 // draw for the first base circle
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
   let indices = []

   Q.push(cylinder_points[7*i])
   Q.push(cylinder_points[7*i+1])
   Q.push(cylinder_points[7*i+2])

   R.push(cylinder_points[7*i+7])
   R.push(cylinder_points[7*i+8])
   R.push(cylinder_points[7*i+9])

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
   normalverts.push (trianglecenter[0] -  (cross[0]*0.07))
   normalverts.push (trianglecenter[1] -  (cross[1]*0.07))
   normalverts.push (trianglecenter[2] -  (cross[2]*0.07))
   normalverts.push(1)
   normalverts.push(0)
   normalverts.push(0)
   normalverts.push(1)
  

   normalverts.push (trianglecenter[0])
   normalverts.push (trianglecenter[1])
   normalverts.push (trianglecenter[2])
   normalverts.push(1)
   normalverts.push(0)
   normalverts.push(0)
   normalverts.push(1)
    
   indices.push(0)
   indices.push(1)
   setVertexBuffer(gl, new Float32Array(normalverts));
   setIndexBuffer(gl, new Uint16Array(indices))
   if (checkBox.checked){
     // draw normals (face 1) 
     gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0)    
   }
 } 

 // draw for the second base circle
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
   let indices = []

   Q.push(cylinder_points[7*i+(cylinder_points.length/2)])
   Q.push(cylinder_points[7*i+(cylinder_points.length/2)+1])
   Q.push(cylinder_points[7*i+(cylinder_points.length/2)+2])

   R.push(cylinder_points[7*i+(cylinder_points.length/2)+7])
   R.push(cylinder_points[7*i+(cylinder_points.length/2)+8])
   R.push(cylinder_points[7*i+(cylinder_points.length/2)+9])

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
   normalverts.push (trianglecenter[0] +  (cross[0]*0.07))
   normalverts.push (trianglecenter[1] +  (cross[1]*0.07))
   normalverts.push (trianglecenter[2] +  (cross[2]*0.07))
   normalverts.push(1)
   normalverts.push(0)
   normalverts.push(0)
   normalverts.push(1)
  

   normalverts.push (trianglecenter[0])
   normalverts.push (trianglecenter[1])
   normalverts.push (trianglecenter[2])
   normalverts.push(1)
   normalverts.push(0)
   normalverts.push(0)
   normalverts.push(1)
    
   indices.push(0)
   indices.push(1)
   setVertexBuffer(gl, new Float32Array(normalverts));
   setIndexBuffer(gl, new Uint16Array(indices))
   if (checkBox.checked){
     // draw normals (face 2) 
     gl.drawElements(gl.LINE_STRIP, indices.length, gl.UNSIGNED_SHORT, 0)    
   }
 } 
 return cylindernormals
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
  let magnitude = findMagnitude(P) 
  normalized.push (P[0]/magnitude)
  normalized.push (P[1]/magnitude)
  normalized.push (P[2]/magnitude)
  return normalized
}

function findMagnitude(P){
 let magnitude = (Math.sqrt ((P[0]*P[0])+(P[1]*P[1])+(P[2]*P[2])))
 return magnitude 
}

function dot(QR,QS){
  let dot = ((QR[0]*QS[0])+(QR[1]*QS[1])+(QR[2]*QS[2]))
  return dot
}

function checkBoxClick(ev, gl, canvas, a_Position){
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
 
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT); 
  // draw all finished cylinder 
  drawAllCylinders(gl,canvas,a_Position)
}

function shift (ev,gl,canvas,a_Position){   
  // draw all finished cylinder 
  for (var i =0 ; i < oldlines.length ; i++){       
    if (oldlines[i].length >= 4){
     for (var j =0; j < oldlines[i].length;j+=2){    
       oldlines[i][j] = oldlines[i][j] +0.01 
     }
    } 
  }
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawAllCylinders(gl,canvas,a_Position)
}


function mvlight (ev,gl,canvas,a_Position){   
  if (light1V.length == 3){
    light1V[2] = light1V[2]-0.2
  }
  if (light2V.length == 3){
    light2V[2] = light1V[2]-0.2
  }
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawAllCylinders(gl,canvas,a_Position)
}


function rotateY (ev,gl,canvas,a_Position){   
  if (light1V.length == 3){
    let newLight = []
    let radian = Math.PI/6 
    newLight.push((light1V[0] * Math.cos(radian)) + (light1V[2] * Math.sin(radian))) 
    newLight.push(light1V[1])
    newLight.push((light1V[0] * (-1  * Math.sin(radian))) + (light1V[2] * Math.cos(radian)))
    light1V= newLight
  }
  if (light2V.length == 3){
    let newLight = []
    let radian = Math.PI/6 
    newLight.push((light2V[0] * Math.cos(radian)) + (light2V[2] * Math.sin(radian))) 
    newLight.push(light2V[1])
    newLight.push((light2V[0] * (-1  * Math.sin(radian))) + (light2V[2] * Math.cos(radian)))
    light2V= newLight
  }
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawAllCylinders(gl,canvas,a_Position)
}

function max300 (ev,gl,canvas,a_Position,n){          
  if (n==300)
    return
  if (n%2==0){
    redLightBox.checked=true  
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawAllCylinders(gl,canvas,a_Position)
  }
  if (n%2==0){
    whiteLightBox.checked=false
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawAllCylinders(gl,canvas,a_Position)
  }
  
  max300 (ev,gl,canvas,a_Position,n+1)
}
