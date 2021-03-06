// elijah cordova 1425119

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
let Rcolor = 1
let Gcolor = 0
let Bcolor = 0
let Acolor = 1
const defaultcolor = []
defaultcolor.push(Rcolor)
defaultcolor.push(Gcolor)
defaultcolor.push(Bcolor)

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



//lab4 stuff
let light1X = 1.0
let light1Y = 1.0
let light1Z = 1.0
// mode = 1 = gouraud shading
// 2 = phong 
// 3 = rim
// 4 = toon
// 5 = depth
let mode = 2
let text = document.getElementById('currentshader')
text.innerHTML = "PHONG"
let textortho = document.getElementById('currentortho')
textortho.innerHTML = "PROJECTION"

let ambientR = 0.0
let ambientG = 0.0
let ambientB = 0.2

let currentspecularR = 0
let currentspecularG = 1
let currentspecularB = 0

let glossiness = 12.0

//lab5 stuff
let highlighted = []
let thinking = []
let eyeX = 0
let eyeY = 0
let eyeZ = 5
let centerX = 0
let centerY = 0
let centerZ = 2
let rotDeg = -30
let rotX = 0
let rotY= 1
let rotZ = 0
let nP = 1
let orthomode = -1

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
  const rotateAlongY = document.getElementById('rotateAlongY') 
  const shiftX = document.getElementById('shiftX')
  const shiftY = document.getElementById('shiftY')
  const newview = document.getElementById('newview')
  const nearplane = document.getElementById('nearplane')
  const orthomd = document.getElementById('orthomd')
  canvas.onmousedown = function(ev){ leftclick(ev, gl, canvas, a_Position); };
  canvas.onmousemove = function(ev){ move(ev, gl, canvas, a_Position); };
  canvas.oncontextmenu = function(ev){ rightclick(ev, gl, canvas, a_Position); };

  shiftX.onclick = function(ev){ shift(ev, gl, canvas, a_Position); };
  shiftY.onclick = function(ev){ shiftdown(ev, gl, canvas, a_Position); };
  rotateAlongY.onclick = function(ev){ rotateY(ev, gl, canvas, a_Position); };
  newview.onclick = function(ev){ rotateCam(ev, gl, canvas, a_Position); };
  nearplane.oninput = function(ev){ adjustNear(ev, gl, canvas, a_Position,nearplane); };
  orthomd.onclick = function(ev){ toggleortho(ev, gl, canvas, a_Position); };

  // specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);
  // clear <canvas>
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // generalized cylinder 1 
  let init = []
  init.push(1)
  init.push(0)
  init.push(0)
  init.push(0)
  init.push(0)
  init.push(-1)
  init.push(1)
  init.push(-1)
  init.push(0.4)
  init.push(-0.5)
  oldlines.push(init)

  //generalized cylinder 2
  let init2 = []
  init2.push (-0.5)
  init2.push (-0.2)
  init2.push (-0.9)
  init2.push (-0.2)
  init2.push (-0.9)
  init2.push (-0.7)
  init2.push (-0.5)
  init2.push (-0.7)
  oldlines.push(init2)

  //generalized cylinder 3
  let init3 = []
  init3.push (-0.9)
  init3.push (0.5)
  init3.push (-0.9)
  init3.push (0.9)
  init3.push (-0.1)
  init3.push (0.9)
  oldlines.push(init3)


  //generalized cylinder 4
  let init4 = []
  init4.push (-0.4)
  init4.push (0.0)
  init4.push (-0.4)
  init4.push (0.2)
  oldlines.push(init4)

  for (var i =0 ; i < oldlines.length; i++){
    highlighted.push(0)
    thinking.push(0)
  }
  // draw all finished cylinder 
  drawAllCylinders(gl,canvas,a_Position)
}



function leftclick(ev, gl, canvas, a_Position) {  
   // if left click 
   if (ev.button == 2)
     return
   var x = ev.clientX; // x coordinate of a mouse pointer
   var y = ev.clientY; // y coordinate of a mouse pointer
   var rect = ev.target.getBoundingClientRect() ;
   console.log(x + " " + y + " left click\n")
   if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
      var picked = check(gl, canvas, a_Position,x_in_canvas,y_in_canvas);
      if (picked){
          // if ambient light exists, you picked an object (ambient light is > 0 by default)
          if (picked[2] > 0){
          console.log("R:" + picked[0] + " G:" + picked[1] + " B:" + picked[2] + " A:" + picked[3])
             let numc = 255 - picked[3] 
             if (highlighted[numc] == 0){
               for (var i =0 ; i < highlighted.length; i++){
                 highlighted[i]=0
               }
               highlighted[numc] = 1
             }
             else{
               highlighted[numc] = 0
             }
          }     
          else{
            console.log("YOU PICKED THE BLANK CANVAS! (0,0,0,1) RESETTING ALL HIGHLIGHTS!")   
            for (var i =0 ; i < highlighted.length; i++){
              highlighted[i]=0
            }
          }
      }
    }
 //lab4 legacy 
 //  previousX = x
 //  previousY = y
 //  // Store the coordinates to g_points array
 //  g_points.push(x); g_points.push(y);
 //
   
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
  // draw all finished cylinder 
  drawAllCylinders(gl,canvas,a_Position)

 //lab4 legacy
 //  var vertices = new Float32Array(g_points)
 //  // draw currently working line with points
 //  draw (gl,canvas,a_Position,vertices,width)
 //
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

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  // draw all finished cylinder, clear arrays for next line segment 
  previousX = null  
  previousY = null
  g_points = []
  drawAllCylinders(gl,canvas,a_Position)
}

function move (ev,gl,canvas,a_Position){   
   // if left click 
   if (ev.button == 2)
     return
   var x = ev.clientX; // x coordinate of a mouse pointer
   var y = ev.clientY; // y coordinate of a mouse pointer
   var rect = ev.target.getBoundingClientRect() ;

   if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      // If pressed position is inside <canvas>, check if it is above object
      var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;
      var picked = check(gl, canvas, a_Position,x_in_canvas,y_in_canvas);
      if (picked){
          // if ambient light exists, you picked an object (ambient light is > 0 by default)
          if (picked[2] > 0 && picked[3] > 0){
            let numc = 255 - picked[3] 
            for (var i =0 ; i < highlighted.length; i++){
              thinking[i]=0
            }
              thinking[numc] = 1
          }     
          else {
           for (var i =0 ; i < highlighted.length; i++){
             thinking[i]=0
           }
          }
      }
    }
   
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 
  // draw all finished cylinder 
  drawAllCylinders(gl,canvas,a_Position)

}

// used to draw polyline given any array of 2d vertices (x1,y1,x2,y2,xn,yn)

function draw (gl,canvas,a_Position,vertices,linewidth){   
   let vert = []     
   let ind = []
   let colors = []
   let normie = []
   for (var i =0; i<vertices.length;i+=2){
    let point = []
    vert.push(vertices[i]) 
    vert.push(vertices[i+1]) 
    vert.push(0)
    point.push(vertices[i]) 
    point.push(vertices[i+1]) 
    point.push(0)
    colors.push(1)
    colors.push(1)
    colors.push(0)
    colors.push(1-(200/255))
    // normalize point 
    point = normalize(point)
    normie.push(0) 
    normie.push(0) 
    normie.push(1) 
  }
    var n = initVertexBuffers(gl,vert,colors,normie,ind)
    if (n<0){
      console.log('failed to set vert info')
      return
    }
    ind.push(0)
    ind.push(1)
    ind.push(2)
    ind.push(0)
    // Set the clear color and enable the depth test
    gl.enable(gl.DEPTH_TEST);
    initAttrib(gl,canvas,-1.0)
    //draw the linestrip!
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
    var n = initVertexBuffers(gl,vert,colors,normie,ind)
    if (n<0){
      console.log('failed to set vert info')
      return
    }
    // Set the clear color and enable the depth test
    gl.enable(gl.DEPTH_TEST);
    initAttrib(gl,canvas,-1.0)
    //draw the linestrip!
    gl.drawElements(gl.LINE_STRIP, n, gl.UNSIGNED_BYTE, 0);
}

// simple function to draw all cylinders based on all established line segments
// vertices are storred in an array of arrays, where the index is the polyline  [(x,y),(x,y)],[(x,y),(x,y)] ]
function drawAllCylinders(gl,canvas,a_Position){
  // draw all finished cylinder 
  for (var i =0 ; i < oldlines.length ; i++){       
    previousFace = []
    let tempNormalholder = []
    if (oldlines[i].length >= 4){
     var loop = (((oldlines[i].length/2)-1)*2)
     for (var j =0; j < loop;j+=2){    
      drawcylinder(gl,canvas,a_Position,radius,sides,oldlines[i][j],oldlines[i][j+1],oldlines[i][j+2],oldlines[i][j+3],i)
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
function drawcylinder(gl,canvas,a_Position,r,s,x1,y1,x2,y2,numpolyline){
  Acolor = 1 - (numpolyline/255)  
  //  ** DRAW CYLINDERS **
  //
  // multiply degrees by convert to get value in radians  
  // a circle is 360 degrees, rotate by (360 / s) degrees for every side, where n is number of sides!
  let convert = Math.PI/180 
  let numsides = 360/s

  // get the angle that the line segment forms
  let deltaX = x2-x1
  let deltaY = y2-y1 
  let degreeToRotate = Math.atan2(deltaY,deltaX)
  degreeToRotate = ((2* Math.PI)-degreeToRotate)
  
  // first we'll draw a circle by rotating around the x axis, then use a transformation matrix to rotate it
  // by the angle we found previously so the circle fits around the axis formed by the line segment
  let unrotated = []

  for (var i=0 ; i <=360; i+=numsides){ 
    unrotated.push(0)
    unrotated.push((Math.cos(convert*i))*r)
    unrotated.push(Math.sin(convert*i)*r)
  } 
   let cylinder_points = []     
   let indices = []
   let colors = []
   let normie = []
  //first circle
  for (var i = 0 ; i < unrotated.length; i+=3){
   cylinder_points.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +  x1) 
   cylinder_points.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) + y1)
   cylinder_points.push(unrotated[i+2])
  }

  // second circle
  for (var i = 0 ; i < unrotated.length; i+=3){
   cylinder_points.push((unrotated[i] * Math.cos(degreeToRotate)) + (unrotated[i+1] * Math.sin(degreeToRotate)) +  x2) 
   cylinder_points.push((unrotated[i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[i+1] * Math.cos(degreeToRotate)) + y2)
   cylinder_points.push(unrotated[i+2])
  }

 
  //calculate face normals from cylinder points 
  let cylindernormals = calcnormals(gl,canvas,a_Position,r,s,x1,y1,x2,y2,cylinder_points) 
  // n+1th normal (the point that comes after the last point is the same as the first point) 
  cylindernormals.push(cylindernormals[0])
  cylindernormals.push(cylindernormals[1])
  cylindernormals.push(cylindernormals[2])
  cylinder_points = []
  colors = []
  
  cylinder_points.push((unrotated[0] * Math.cos(degreeToRotate)) + (unrotated[1] * Math.sin(degreeToRotate)) +  x1) 
  cylinder_points.push((unrotated[0] * (-1  * Math.sin(degreeToRotate))) + (unrotated[1] * Math.cos(degreeToRotate)) + y1)
  cylinder_points.push(unrotated[2])
  normie.push((cylindernormals[0]+cylindernormals[27]) / 2)
  normie.push((cylindernormals[1]+cylindernormals[28]) / 2)
  normie.push((cylindernormals[2]+cylindernormals[29]) / 2)
  colors.push(Rcolor)
  colors.push(Gcolor)
  colors.push(Bcolor)
  colors.push(Acolor)


  for (var i = 1 ; i < s+1; i++){
   cylinder_points.push((unrotated[3*i] * Math.cos(degreeToRotate)) + (unrotated[3*i+1] * Math.sin(degreeToRotate)) +  x1) 
   cylinder_points.push((unrotated[3*i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[3*i+1] * Math.cos(degreeToRotate)) + y1)
   cylinder_points.push(unrotated[3*i+2])
   normie.push((cylindernormals[3*i]+cylindernormals[3*(i-1)])/2) 
   normie.push((cylindernormals[3*i+1]+cylindernormals[3*(i-1)+1])/2) 
   normie.push((cylindernormals[3*i+2]+cylindernormals[3*(i-1)+2])/2) 
   colors.push(Rcolor)
   colors.push(Gcolor)
   colors.push(Bcolor)
   colors.push(Acolor)
  }
  // second circle
  cylinder_points.push((unrotated[0] * Math.cos(degreeToRotate)) + (unrotated[1] * Math.sin(degreeToRotate)) +  x2) 
  cylinder_points.push((unrotated[0] * (-1  * Math.sin(degreeToRotate))) + (unrotated[1] * Math.cos(degreeToRotate)) + y2)
  cylinder_points.push(unrotated[2])
  normie.push((cylindernormals[0]+cylindernormals[27]) / 2)
  normie.push((cylindernormals[1]+cylindernormals[28]) / 2)
  normie.push((cylindernormals[2]+cylindernormals[29]) / 2)
  colors.push(Rcolor)
  colors.push(Gcolor)
  colors.push(Bcolor)
  colors.push(Acolor)
  for (var i = 1 ; i < s+1; i++){
   cylinder_points.push((unrotated[3*i] * Math.cos(degreeToRotate)) + (unrotated[3*i+1] * Math.sin(degreeToRotate)) +  x2) 
   cylinder_points.push((unrotated[3*i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[3*i+1] * Math.cos(degreeToRotate)) + y2)
   cylinder_points.push(unrotated[3*i+2])
   normie.push((cylindernormals[3*i]+cylindernormals[3*(i-1)])/2) 
   normie.push((cylindernormals[3*i+1]+cylindernormals[3*(i-1)+1])/2) 
   normie.push((cylindernormals[3*i+2]+cylindernormals[3*(i-1)+2])/2) 
   colors.push(Rcolor)
   colors.push(Gcolor)
   colors.push(Bcolor)
   colors.push(Acolor)
  }

  // 2 points to represent the center
   cylinder_points.push(x2) 
   cylinder_points.push(y2)
   cylinder_points.push(0)
   colors.push(Rcolor)
   colors.push(Gcolor)
   colors.push(Bcolor)
   colors.push(Acolor)

  let len = cylinder_points.length/6
  // cool traiangles
  for (var i=0 ; i < s; i++){
    indices.push(i)
    indices.push(i+1) 
    indices.push(len+i)
    indices.push(i)
  
    indices.push(i+1)
    indices.push(i)
    indices.push(len+i+1)
    indices.push(i+1)

    indices.push(len+i+1)
    indices.push(len+i) 
    indices.push(i+1)
    indices.push(len+i+1)
  }

  var n = initVertexBuffers(gl,cylinder_points,colors,normie,indices)
  if (n<0){
    console.log('failed to set vert info')
    return
  }
  // Set the clear color and enable the depth test
  gl.enable(gl.DEPTH_TEST);
  initAttrib(gl,canvas,numpolyline)

  //draw the cylinder!
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
  

  // ** DRAW CAP **
  // (FOR SMOOTH EDGES) 
  let cap_points = []
  if (previousFace.length < 1){
    // second circle
    for (var i = 0 ; i < s+1 ; i++){
     previousFace.push((unrotated[3*i] * Math.cos(degreeToRotate)) + (unrotated[3*i+1] * Math.sin(degreeToRotate)) +  x2) 
     previousFace.push((unrotated[3*i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[3*i+1] * Math.cos(degreeToRotate)) + y2)
     previousFace.push(unrotated[3*i+2])
    }
    return
  } 
  for (var j=0 ; j < previousFace.length ;j++){
    cap_points.push(previousFace[j])    
  }
  previousFace = []
  for (var i = 0 ; i < s+1 ; i++){
   cap_points.push((unrotated[3*i] * Math.cos(degreeToRotate)) + (unrotated[3*i+1] * Math.sin(degreeToRotate)) +  x1) 
   cap_points.push((unrotated[3*i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[3*i+1] * Math.cos(degreeToRotate)) + y1)
   cap_points.push(unrotated[3*i+2])
  }
  for (var i = 0 ; i < s+1 ; i++){
   previousFace.push((unrotated[3*i] * Math.cos(degreeToRotate)) + (unrotated[3*i+1] * Math.sin(degreeToRotate)) +  x2) 
   previousFace.push((unrotated[3*i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[3*i+1] * Math.cos(degreeToRotate)) + y2)
   previousFace.push(unrotated[3*i+2])
  }
  var capvertices = new Float32Array(cap_points)
  let caplen = capvertices.length/14;
  if (caplen === 0)
   return
  var n = initVertexBuffers(gl,capvertices,colors,normie,indices)
  if (n<0){
    console.log('failed to set vert info')
    return
  }
  // Set the clear color and enable the depth test
  gl.enable(gl.DEPTH_TEST);
  initAttrib(gl,canvas,numpolyline)
  //draw the cylinder!
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function calcnormals(gl,canvas,a_Position,r,s,x1,y1,x2,y2,cylinder_points){
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


     S.push(cylinder_points[3*i])
     S.push(cylinder_points[3*i+1])
     S.push(cylinder_points[3*i+2])

     R.push(cylinder_points[3*i+(cylinder_points.length/2)])
     R.push(cylinder_points[3*i+(cylinder_points.length/2)+1])
     R.push(cylinder_points[3*i+(cylinder_points.length/2)+2]) 
     
     Q.push(cylinder_points[3*i+3])
     Q.push(cylinder_points[3*i+4])
     Q.push(cylinder_points[3*i+5])

     QR.push(R[0]-Q[0]) 
     QR.push(R[1]-Q[1]) 
     QR.push(R[2]-Q[2])


     QS.push(S[0]-Q[0]) 
     QS.push(S[1]-Q[1]) 
     QS.push(S[2]-Q[2])

     // the surface normal vector is calculated by QR x QS which is perpendicular to the plane
     // use normalize to find the unit vector
     cross = normalize(findCross(QR,QS))
     cylindernormals.push(cross[0])
     cylindernormals.push(cross[1])
     cylindernormals.push(cross[2])
  }
  return cylindernormals
}

// lab4 stuff 
function initVertexBuffers(gl,vertices,colors,normals,indices){
  vertices = new Float32Array(vertices)
  colors = new Float32Array(colors)
  normals = new Float32Array(normals)
  indices = new Uint8Array(indices)
  // Write the vertex property to buffers (coordinates, colors and normals)
  if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Color', colors, 4, gl.FLOAT)) return -1;
  if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

 // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // Write the indices to the buffer object
  var indexBuffer = gl.createBuffer();
  if (!indexBuffer) {
    console.log('Failed to create the buffer object');
    return false;
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  return indices.length
}

function initArrayBuffer (gl, attribute, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_attribute = gl.getAttribLocation(gl.program, attribute);
  if (a_attribute < 0) {
    console.log('Failed to get the storage location of ' + attribute);
    return false;
  }
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return true;
}

function initAttrib(gl,canvas,numpolyline) {
  // Get the storage locations of uniform variables and so on
  if (mode == 1 ){
    var u_vmode = gl.getUniformLocation(gl.program, 'u_vmode')
    var u_fmode = gl.getUniformLocation(gl.program, 'u_fmode')
    if (!u_vmode){
      console.log ("failed to get vmode!")
      return
    }
    if (!u_fmode){
      console.log ("failed to get fmode!")
      return
    }
    // Set the vertex /fragment shader mode
    gl.uniform1f(u_vmode,parseFloat(1.0))
    gl.uniform1f(u_fmode,parseFloat(1.0))
    var u_DiffuseLight = gl.getUniformLocation(gl.program, 'u_DiffuseLight')
    var u_LightPosition= gl.getUniformLocation(gl.program, 'u_LightPosition')
    var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight')
    var u_SpecularLightF = gl.getUniformLocation(gl.program, 'u_SpecularLightF')
    var u_specularLightV = gl.getUniformLocation(gl.program, 'u_specularLightV')
    var u_ViewPositionF = gl.getUniformLocation(gl.program, 'u_ViewPositionF')
    var u_exponentV = gl.getUniformLocation(gl.program, 'u_exponentV')
    if (!u_DiffuseLight || !u_LightPosition || !u_AmbientLight || !u_SpecularLightF || !u_ViewPositionF || !u_exponentV || !u_specularLightV) { 
      console.log('Failed to get the storage location');
      console.log(u_DiffuseLight)
      console.log(u_LightPosition)
      console.log(u_AmbientLight)
      console.log(u_SpecularLightF)
      console.log(u_ViewPositionF)
      console.log(u_exponentV)
      console.log(u_specularLightV)
      return;
    }
    // Set the light color (white)
    gl.uniform3f(u_DiffuseLight, 1.0, 1.0, 1.0);
    // Set the light Position (in the world coordinate)
    gl.uniform3f(u_LightPosition, light1X, light1Y, light1Z);
    // Set the ambient light
    gl.uniform3f(u_AmbientLight, ambientR, ambientG, ambientB)
    // set the specular light
    gl.uniform3f(u_SpecularLightF, currentspecularR, currentspecularG, currentspecularB)
    gl.uniform3f(u_specularLightV, currentspecularR, currentspecularG, currentspecularB)
    gl.uniform3f(u_ViewPositionF, 0.0, 0.0, -1.0)
    gl.uniform1f(u_exponentV,glossiness)
  }
  if (mode >= 2){
    var u_vmode = gl.getUniformLocation(gl.program, 'u_vmode')
    var u_fmode = gl.getUniformLocation(gl.program, 'u_fmode')
    if (!u_vmode){
      console.log ("failed to get vmode!")
      return
    }
    if (!u_fmode){
      console.log ("failed to get fmode!")
      return
    }
    // Set the vertex /fragment shader mode
    if (mode == 2){
      gl.uniform1f(u_vmode,parseFloat(2))
      gl.uniform1f(u_fmode,parseFloat(2))
    }
    if (mode == 3){
      gl.uniform1f(u_vmode,parseFloat(3))
      gl.uniform1f(u_fmode,parseFloat(3))
    }
    if (mode == 4){
      gl.uniform1f(u_vmode,parseFloat(4))
      gl.uniform1f(u_fmode,parseFloat(4))
    }
    if (mode == 5){
      gl.uniform1f(u_vmode,parseFloat(5))
      gl.uniform1f(u_fmode,parseFloat(5))
    }
   
    var u_orthomode = gl.getUniformLocation(gl.program, 'u_orthomode')
    if (!u_orthomode){
      console.log("failed to get orthomode!")
      return
    }
    gl.uniform1f(u_orthomode,orthomode)
    var u_DiffuseLightF = gl.getUniformLocation(gl.program, 'u_DiffuseLightF')
    var u_LightPositionF= gl.getUniformLocation(gl.program, 'u_LightPositionF')
    var u_AmbientLightF = gl.getUniformLocation(gl.program, 'u_AmbientLightF')
    var u_SpecularLightF = gl.getUniformLocation(gl.program, 'u_SpecularLightF')
    var u_ViewPositionF = gl.getUniformLocation(gl.program, 'u_ViewPositionF')
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');  
    var u_exponent = gl.getUniformLocation(gl.program, 'u_exponent')
    if (!u_DiffuseLightF || !u_LightPositionF || !u_AmbientLightF || !u_SpecularLightF || !u_ViewPositionF || !u_exponent || !u_ModelMatrix || !u_MvpMatrix || !u_NormalMatrix) { 
      console.log('Failed to get the storage location');
      console.log(u_DiffuseLightF)
      console.log(u_LightPositionF)
      console.log(u_AmbientLightF)
      console.log(u_SpecularLightF)
      console.log(u_ViewPositionF)
      console.log(u_exponent)
      console.log(u_ModelMatrix)
      console.log(u_MvpMatrix)
      console.log(u_NormalMatrix)
      return;
    } 
  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals

    // Calculate the model matrix
    modelMatrix.setRotate(rotDeg, rotX, rotY, rotZ); // Rotate around the y-axis
    // Calculate the view projection matrix
    mvpMatrix.setPerspective(30, canvas.width/canvas.height, nP, 10);
    mvpMatrix.lookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, 0, 1, 0);
    mvpMatrix.multiply(modelMatrix);
    // Calculate the matrix to transform the normal based on the model matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();

    // Pass the model matrix to u_ModelMatrix
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Pass the model view projection matrix to u_mvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Pass the transformation matrix for normals to u_NormalMatrix
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    // Set the light color (white)
    gl.uniform3f(u_DiffuseLightF, 1.0, 1.0, 1.0);
    // Set the light Position (in the world coordinate)
    gl.uniform3f(u_LightPositionF, light1X, light1Y, light1Z);
    // Set the ambient light
    gl.uniform3f(u_AmbientLightF, ambientR, ambientG, ambientB)
    //set the specular light 
    gl.uniform3f(u_SpecularLightF, currentspecularR, currentspecularG, currentspecularB)
    gl.uniform3f(u_ViewPositionF, 0.0, 0.0, -1.0)
    gl.uniform1f(u_exponent,glossiness)
  }
  // set highlights ( if required!)
  var u_HighlightF = gl.getUniformLocation(gl.program, 'u_HighlightF')
  if (!u_HighlightF){
    console.log(" failed to get location of u_HiglightF!")
  }
  // possible highlights
  // reserved for buttons only
  if (numpolyline == -1.0){
    gl.uniform3f(u_AmbientLight, 0.0, 0.0, 0.0)
    gl.uniform3f(u_HighlightF, 2.0, 2.0, 0.0);
    return
  }

  //no highlight
  gl.uniform3f(u_HighlightF, 0, 0, 0);
  // hover highlight (priority 2)
  if (thinking[numpolyline] == 1)
    gl.uniform3f(u_HighlightF, 0, 0.5, 0);
  // select highlight (priority 1)
  if (highlighted[numpolyline] == 1)
    gl.uniform3f(u_HighlightF, 0.2, 0.2, 0.2);
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

function rotateY (ev,gl,canvas,a_Position){   
  let radian = (Math.PI/12)
  let newx = 0.0
  let newy = 0.0
  let newz = 0.0
  newx = ((light1X * Math.cos(radian)) + (light1Z * Math.sin(radian))) 
  newy = light1Y
  newz = ((light1X * (-1  * Math.sin(radian))) + (light1Z * Math.cos(radian)))
  light1X = newx
  light1Y = newy
  light1Z = newz 
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawAllCylinders(gl,canvas,a_Position)
}

function shift (ev,gl,canvas,a_Position){   
  // draw all finished cylinder 
  for (var i =0 ; i < oldlines.length ; i++){       
    if (oldlines[i].length >= 4){
     for (var j =0; j < oldlines[i].length;j+=2){    
       oldlines[i][j] = oldlines[i][j] + 0.2 
     }
    } 
  }
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawAllCylinders(gl,canvas,a_Position)
}

function shiftdown(ev,gl,canvas,a_Position){   
  // draw all finished cylinder 
  for (var i =0 ; i < oldlines.length ; i++){       
    if (oldlines[i].length >= 4){
     for (var j =0; j < oldlines[i].length;j+=2){    
       oldlines[i][j+1] = oldlines[i][j+1] - 0.2 
     }
    } 
  }
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawAllCylinders(gl,canvas,a_Position)
}

function check(gl, canvas, a_Position,x,y) {
  drawAllCylinders(gl,canvas,a_Position)
  var pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return pixels 
}

function rotateCam(ev, gl, canvas, a_Position){
  orthomode = -1
  light1Z = 1
  if (orthomode == -1){
    textortho.innerHTML = "PROJECTION"
  }
  // Clear <canvas>
  eyeX = eyeX * -1
  eyeY = eyeY * -1
  eyeZ = eyeZ * -1
  centerX = centerX * -1
  centerY = centerY * -1
  centerZ = centerZ * -1
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawAllCylinders(gl,canvas,a_Position)
}
function adjustNear(ev, gl, canvas, a_Position,nearplane){
  orthomode = -1
  light1Z = 1
  if (orthomode == -1){
    textortho.innerHTML = "PROJECTION"
  }
  nP=parseInt(nearplane.value)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawAllCylinders(gl,canvas,a_Position)
}

function toggleortho(ev, gl, canvas, a_Position){
  textortho.innerHTML = "ORTHO"
  orthomode = orthomode * -1
  light1Z = light1Z * -1
  if (orthomode == -1){
    textortho.innerHTML = "PROJECTION"
  }
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  drawAllCylinders(gl,canvas,a_Position)
}
