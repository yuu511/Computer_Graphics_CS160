// elijah cordova 1425119
var VSHADER_SOURCE = null; // vertex shader program
var FSHADER_SOURCE = null; // fragment shader program
// old polyline, use it to initialize cylinders
let oldlines = [] // all previous completed lines
// (x)Color = current color setting, oldcolors = all old colors (an array of arrays)
let Rcolor = 1
let Gcolor = 0
let Bcolor = 0
let Acolor = 1

// cylinder_points = currently drawing cylinder points
// sides = number of size the cylinder will have , radius = defualt radius
let cylinder_points = []
let sides = 10
let radius = 0.20 
//lab4 stuff (shading)
let light1X = 1.0
let light1Y = 1.0
let light1Z = 1.0
// mode ( deprecated )
// 2 = phong 3 = rim 4 = toon 5 = depth
let mode = 2
let ambientR = 0.0
let ambientG = 0.0
let ambientB = 0.2
let currentspecularR = 1
let currentspecularG = 1
let currentspecularB = 1
let glossiness = 100.0

//lab5 stuff (projection + selection)
let highlighted = []
let thinking = []
let eyeX = 0
let eyeY = 0
let eyeZ = 5
let centerX = 0
let centerY = 0
let centerZ = 0
let rotDeg = 0
let rotX = 0
let rotY= 0
let rotZ = 1
let nP = 3
let orthomode = -1
let ANGLE_STEP = 0.0

//lab6 stuff (translations)
// oldc_points = all current cylinder points, arranged in array of arrays
// e.x. oldc_points [0][1] = cluster(polyline) 0 , cylinder 1
let oldc_line = []
let oldc_points = []
let oldc_normals_line = []
let oldc_normals = []
let originalc_points = []
// refrence for left drag
let previousX = null
let previousY = null 
let previousXr = null
let previousYr = null 
let previousXm = null
let previousYm = null 
let g_last = Date.now()
let sc = []
let transl = []
let roX = []
let roY = []
let CUBEMODE = 0
let FALLDOWN = -1
let reference = []
let tickB = 0
let all_old_angles = []
let individual_angles = []

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
  // cancel context menu
  document.addEventListener("contextmenu", function (e) {
         e.preventDefault();
  }, false)
  canvas.onmousedown = function(ev){ click(ev, gl, canvas, a_Position); };
  canvas.onmousemove = function(ev){ move(ev, gl, canvas, a_Position); };
  canvas.onmouseup = function(ev){ reset(ev, gl, canvas, a_Position); };
  canvas.onwheel = function(ev){ scaleradius(ev, gl, canvas, a_Position); };
  window.onkeypress = function(ev){ keypress(ev, gl, canvas, a_Position); };

   // generalized cylinder 1 
   let init = []
   init.push(0.5)
   init.push(0)
   init.push(-0.5)
   init.push(0)
 //  init.push(-0.5)
 //  init.push(-1)
 //  init.push(0.5)
 //  init.push(-1)
 //  init.push(0.4)
 //  init.push(-0.5)
   oldlines.push(init)

  //generalized cylinder 2
  let init2 = []
  init2.push (-0.9)
  init2.push (0.5)
  init2.push (-0.9)
  init2.push (0.9)
 // init2.push (-0.1)
 // init2.push (0.9)
  oldlines.push(init2)
  for (var i =0 ; i < oldlines.length; i++){
    highlighted.push(0)
    thinking.push(0)
    roX.push(0)
    roY.push(0)
    sc.push(0)
    transl.push([])
  }
  // init all finished cylinder 
  initAllCylinders(gl,canvas,a_Position)
  // specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
  if (tickB==1){
  var currentAngle = 0.0
      var tick = function (){
        if (FALLDOWN == 1){
          eyeZ = eyeZ + 1.0
          eyeY = eyeY + 1.0
          eyeX = eyeX + 1.0
        }
        currentAngle = animate(currentAngle)
        rotDeg = currentAngle
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
        requestAnimationFrame(tick,canvas)
      }
      tick()
      var g_last = Date.now()
  }
}

function animate(angle) {
  if (CUBEMODE == 1){
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    r_last = now;
    let blueangle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    if (blueangle %  120 <= 60){
      return 90
    }
    if (blueangle % 120 >61){
      return -90
    }
    if (blueangle % 60 == 0){
      return 180
    }
  }
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

// various keypress functions
function keypress(ev, gl, canvas, a_Position){
  if (ev.which == "s".charCodeAt(0)){
    shear(ev, gl, canvas, a_Position)
  }
  if (ev.which == "t".charCodeAt(0)){
    twist(ev, gl, canvas, a_Position)
  }
  if (ev.which == "r".charCodeAt(0)){
    if (ANGLE_STEP == 0)
      ANGLE_STEP = 200
    else 
      ANGLE_STEP = 0
  }
  if (ev.which == "q".charCodeAt(0)){
    if (ANGLE_STEP == 0){
      CUBEMODE = 1
      ANGLE_STEP = 10
    }
    else{
      CUBEMODE = 0 
      ANGLE_STEP = 0 
   }
  }
  if (ev.which == "f".charCodeAt(0)){
      FALLDOWN = FALLDOWN * -1
      if (FALLDOWN == -1){
        eyeX = 0
        eyeY = 0
        eyeZ = 5
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
      }
  }
  if (ev.which == "v".charCodeAt(0)){
    scaleradius(ev, gl, canvas, a_Position)
  }
  if (ev.which == "b".charCodeAt(0)){
    scaleradius(ev, gl, canvas, a_Position)
  }
}

// if rightclick, do rotating, 
// else if middleclick do translate/ rotate z,
// else do highlighting /transformation (left click).
function click(ev, gl, canvas, a_Position) {  
   // if mid click
   if (ev.button == 1){
     midclick(ev, gl, canvas, a_Position)
     return
   }
   // if right click 
   if (ev.button == 2){
     rightclick(ev, gl, canvas, a_Position)
     return
   }
   var x = ev.clientX; // x coordinate of a mouse pointer
   var y = ev.clientY; // y coordinate of a mouse pointer
   var rect = ev.target.getBoundingClientRect() ;
   console.log(x + " " + y + " left click\n")
   let xP = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
   let yP = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
   previousX = xP
   previousY = yP
   for (var i =0 ; i < highlighted.length;i++){
     if (highlighted[i]==1){
       canvas.onmousemove = function(ev){ drag(ev, gl, canvas, a_Position); }
     }
   }
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
   
 for (var i =0 ; i < highlighted.length;i++){
   if (highlighted[i]==1){
     canvas.onmousemove = function(ev){ drag(ev, gl, canvas, a_Position); }
   }
 }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // draw all finished cylinder 
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}

function rightclick (ev,gl,canvas,a_Position){   
  let x = ev.clientX; // x coordinate of a mouse pointer
  let y = ev.clientY; // y coordinate of a mouse pointer
  let rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  console.log(x + " " + y + " right click\n")
  previousXr = x
  previousYr = y
  for (var i =0 ; i < highlighted.length;i++){
    if (highlighted[i]==1){
      canvas.onmousemove = function(ev){ dragR(ev, gl, canvas, a_Position); }
    }
  }
}
// middle click
function midclick(ev, gl, canvas, a_Position){
  let x = ev.clientX; // x coordinate of a mouse pointer
  let y = ev.clientY; // y coordinate of a mouse pointer
  let rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  console.log(x + " " + y + " mid click\n")
  previousXm = x
  previousYm = y
  for (var i =0 ; i < highlighted.length;i++){
    if (highlighted[i]==1){
      canvas.onmousemove = function(ev){ dragM(ev, gl, canvas, a_Position); }
    }
  }
}
function move (ev,gl,canvas,a_Position){   
   // if right click 
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
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)

}


// simple function to draw all cylinders based on all established line segments
// vertices are storred in an array of arrays, where the index is the polyline  [(x,y),(x,y)],[(x,y),(x,y)] ]
function initAllCylinders(gl,canvas,a_Position){
  // draw all finished cylinder 
  oldc_points = []
  oldc_normals = []
  originalc_points = []
  all_old_angles = []
  for (var i =0 ; i < oldlines.length ; i++){       
    individual_angles = []
    if (oldlines[i].length >= 4){
     var loop = (((oldlines[i].length/2)-1)*2)
     for (var j =0; j < loop;j+=2){    
      initcylinder(gl,canvas,a_Position,radius,sides,oldlines[i][j],oldlines[i][j+1],oldlines[i][j+2],oldlines[i][j+3],i)
     }
     all_old_angles.push(individual_angles)
     oldc_points.push(oldc_line)
     oldc_normals.push(oldc_normals_line) 
     originalc_points.push(oldc_line)
     oldc_line = []
     oldc_normals_line = []
    }
  }  
}


function draw_All(gl,canvas,a_Position,all_cylinder_points,all_cylinder_normals){
  // performs all of the necessary operations
  translate_All(gl,canvas,a_Position,all_cylinder_points,all_cylinder_normals)
  for (var i =0 ; i < oldc_points.length ; i++){       
     if (oldc_points[i].length >= 1){
       for (var j =0; j < oldc_points[i].length ; j++){
         drawcylinderC(gl,canvas,a_Position,oldc_points[i][j],oldc_normals[i][j],sides,i)
       }
     }
  }  
}

// performs all of the appropriate translations
// also translates the normals
function translate_All(gl,canvas,a_Position,cylinder_points,cylinder_normals){
  let scMatrices = []
  let trMatrices = []
  let roXMatrices = []
  let roYMatrices = []
  let old_rotate = []
  let old_translate = []
  let identity = ([
  1.0 , 0.0 , 0.0 , 0.0,
  0.0 , 1.0 , 0.0 , 0.0,
  0.0 , 0.0 , 1.0 , 0.0,
  0.0 , 0.0 , 0.0 , 1.0
  ])
  let identitym = new Matrix4().setIdentity() 
  
  
  //scale
  for (var s=0 ; s < sc.length ; s++){
    if (sc[s] == 0){
      scMatrices.push(identitym) 
    } 
    else {
      let scaleM = new Matrix4().setScale(sc[s],sc[s],sc[s])
      scMatrices.push(scaleM)
    }
  } 
  // rotate
  for (var j=0 ; j < roX.length ; j++){
    if(roX[j] == 0){
      roXMatrices.push(identitym)
    }
    else {
      let rotateX = new Matrix4().rotate(roX[j],1,0,0)
      roXMatrices.push(rotateX)
    }
  }

  for (var k=0 ; k < roY.length ; k++){
    if(roY[k] == 0){
      roYMatrices.push(identitym)
    }
    else {
      let rotateY = new Matrix4().rotate(roY[k],0,1,0)
      roYMatrices.push(rotateY)
    }
  }

  // translate 
  for (var i=0; i < transl.length; i++){
    if (transl[i].length < 1){
      trMatrices.push(identitym)
    }
    else{
      let toTr = new Matrix4().translate(transl[i][0],transl[i][1],transl[i][2])
      trMatrices.push(toTr)
    }
  } 
  // init rotate angle along z 
  for (var i = 0 ; i < all_old_angles.length ; i++){
    let t = []
    for (var j = 0 ; j < all_old_angles[i].length ; j++){
      let rotateZ = new Matrix4().rotate(all_old_angles[i][j],0,0,1)
      t.push(rotateZ)
    }
    old_rotate.push(t)
  }
 

  // init  old translate
  // 3d array : (polyline) (cylinder #) (1st or second circle)
  for (var i =0 ; i < oldlines.length ; i++){       
    let allc_o =[]
    for (var j =0; j < oldlines[i].length-2;j+=2){    
      let bothc_o = []
      let circle1t = new Matrix4().translate(oldlines[i][j],oldlines[i][j+1],0.0)
      let circle2t = new Matrix4().translate(oldlines[i][j+2],oldlines[i][j+3],0.0)
      bothc_o.push(circle1t)
      bothc_o.push(circle2t)
      allc_o.push(bothc_o)
    }
    old_translate.push(allc_o)
  }  
  // let scMatrices = []
  // let trMatrices = []
  // let roXMatrices = []
  // let roYMatrices = []
  // let old_rotate = []
  // let old_translate = []

  // init transformation
  // copy the original circle rotated around x (center 0,0 , rot x)
  let base = JSON.parse(JSON.stringify(reference))
  // copy the current cylinder_points
  let c_p = JSON.parse(JSON.stringify(cylinder_points))
  let initRotate = []
  let test = []
  for (var i = 0 ; i < cylinder_points.length ; i++){
    for (var j = 0 ; j < cylinder_points[i].length ; j++){
     // let circle_one = applyMatrix(base,scMatrices[i])
     // let circle_two = applyMatrix(base,scMatrices[i])

     // circle_one = applyMatrix(circle_one,old_rotate[i][j])
     // circle_two = applyMatrix(circle_two,old_rotate[i][j])

     // circle_one = applyMatrix(circle_one,roXMatrices[i])
     // circle_two = applyMatrix(circle_two,roXMatrices[i])

     // circle_one = applyMatrix(circle_one,roYMatrices[i])
     // circle_two = applyMatrix(circle_two,roYMatrices[i])

     // circle_one = applyMatrix(circle_one,old_translate[i][j][0])
     // circle_two = applyMatrix(circle_two,old_translate[i][j][1])

     // circle_one = applyMatrix(circle_one,trMatrices[i])
     // circle_two = applyMatrix(circle_two,trMatrices[i])

     // let full = circle_one.concat(circle_two)
     // c_p[i][j] = full
     let circle= new Matrix4()
         circle.set(scMatrices[i])
         circle = new Matrix4(circle.concat(old_rotate[i][j]))
         circle = new Matrix4(circle.concat(roXMatrices[i]))
         circle = new Matrix4(circle.concat(roYMatrices[i]))
         let C1 = new Matrix4()
         C1.set(trMatrices[i])
         C1 = new Matrix4(C1.concat(old_translate[i][j][0]))
         C1 = new Matrix4(C1.concat(circle))
         let C2 = new Matrix4()
         C2.set(trMatrices[i])
         C2 = new Matrix4(C2.concat(old_translate[i][j][1]))
         C2 = new Matrix4(C2.concat(circle))
         // console.log(C2.elements[0])
         let circle_one = applyMatrix(base,C1)
         let circle_two = applyMatrix(base,C2)
         console.log(circle_one)
         let full = circle_one.concat(circle_two)
         c_p[i][j] = full
    }
  }   
   console.log(c_p) 
  // apply the changes
   oldc_points = c_p
}
// Draws Cylinders, CAPs between cylinders, and calls a function to draw surface normals if applicable!!

// INPUT : x1,x2 y1,y2 : coordinates of line segment to draw on
// r: value of radius
// s: number of sides
// colors : array [R,G,B,A] of colors
function initcylinder(gl,canvas,a_Position,r,s,x1,y1,x2,y2,numpolyline){
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
 
  individual_angles.push((degreeToRotate * 180) / Math.PI)
  // first we'll draw a circle by rotating around the x axis, then use a transformation matrix to rotate it
  // by the angle we found previously so the circle fits around the axis formed by the line segment
  let unrotated = []
  reference = []

  for (var i=0 ; i <=360; i+=numsides){ 
    unrotated.push(0)
    unrotated.push((Math.cos(convert*i))*r)
    unrotated.push(Math.sin(convert*i)*r)
    reference.push(0)
    reference.push((Math.cos(convert*i))*r)
    reference.push(Math.sin(convert*i)*r)
  } 
  
   let cylinder_points = []     
   let raw_points = []
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
 
  cylinder_points = []
  cylinder_points.push((unrotated[0] * Math.cos(degreeToRotate)) + (unrotated[1] * Math.sin(degreeToRotate)) +  x1) 
  cylinder_points.push((unrotated[0] * (-1  * Math.sin(degreeToRotate))) + (unrotated[1] * Math.cos(degreeToRotate)) + y1)
  cylinder_points.push(unrotated[2])

  for (var i = 1 ; i < s+1; i++){
   cylinder_points.push((unrotated[3*i] * Math.cos(degreeToRotate)) + (unrotated[3*i+1] * Math.sin(degreeToRotate)) +  x1) 
   cylinder_points.push((unrotated[3*i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[3*i+1] * Math.cos(degreeToRotate)) + y1)
   cylinder_points.push(unrotated[3*i+2])
  }
  // second circle
  cylinder_points.push((unrotated[0] * Math.cos(degreeToRotate)) + (unrotated[1] * Math.sin(degreeToRotate)) +  x2) 
  cylinder_points.push((unrotated[0] * (-1  * Math.sin(degreeToRotate))) + (unrotated[1] * Math.cos(degreeToRotate)) + y2)
  cylinder_points.push(unrotated[2])
  for (var i = 1 ; i < s+1; i++){
   cylinder_points.push((unrotated[3*i] * Math.cos(degreeToRotate)) + (unrotated[3*i+1] * Math.sin(degreeToRotate)) +  x2) 
   cylinder_points.push((unrotated[3*i] * (-1  * Math.sin(degreeToRotate))) + (unrotated[3*i+1] * Math.cos(degreeToRotate)) + y2)
   cylinder_points.push(unrotated[3*i+2])
  }
  oldc_line.push(cylinder_points)
  let cylindernormals = calcnormals(gl,canvas,a_Position,s,cylinder_points) 
  // the 1st point
  colors.push(Rcolor)
  colors.push(Gcolor)
  colors.push(Bcolor)
  colors.push(Acolor)
  oldc_normals_line.push(cylindernormals)
}

function calcnormals(gl,canvas,a_Position,s,cylinder_points){
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

function check(gl, canvas, a_Position,x,y) {
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
  var pixels = new Uint8Array(4); // Array for storing the pixel value
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return pixels 
}

// applies a translation matrix  
function drag(ev, gl, canvas, a_Position){
   // if right click 
   if (ev.button == 2){
     console.log ("for left clixx only")
     return
   } 
   let x = ev.clientX; // x coordinate of a mouse pointer
   let y = ev.clientY; // y coordinate of a mouse pointer
   let rect = ev.target.getBoundingClientRect() ;
   let xP = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
   let yP = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
   let deltaX = xP - previousX
   let deltaY = yP - previousY
   let deltaZ = 0
   let tm = []
   for (var i =0 ; i < highlighted.length;i++){
     if (highlighted[i]==1){
       if (transl[i].length < 1){
         transl[i].push(deltaX)
         transl[i].push(deltaY)
         transl[i].push(deltaZ)
       }
       else {
         transl[i][0] = transl[i][0] + deltaX
         transl[i][1] = transl[i][1] + deltaY
         transl[i][2] = transl[i][2] + deltaZ
       }
     }
   }
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
   previousX = xP
   previousY = yP
}

function reset(ev, gl, canvas, a_Position){
  canvas.onmousemove = function(ev){ move(ev, gl, canvas, a_Position); };
}


// scales the radius by applying the appropriate matrix
// must untranslate - > scale - > translate
function scaleradius(ev, gl, canvas, a_Position){
  let scale = 1.0
  if (ev.which == "v".charCodeAt(0)){
    scale = 0.5  
  }
  if (ev.which == "b".charCodeAt(0)){
    scale = 1.5
  }
  // SCROLL : UP
  if(ev.deltaY > 0){
    scale = 0.9  
  }
  // SCROLL : DOWN
  if(ev.deltaY < 0) {
    scale = 1.1 
  }
  for (var i =0 ; i < highlighted.length;i++){
    if (highlighted[i]==1){
      if (sc[i] == 0){
        sc[i] = scale
      }
      else {
        sc[i] = sc[i] * scale 
      }
    }
  }

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}

// using rotation matrix to rotate along _ axis
function dragR(ev, gl, canvas, a_Position){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  let deltaXr = x - previousXr
  let deltaYr = y - previousYr  
  let scalar = 1
  let angle = 45
  // rotate X
  if (Math.abs(deltaXr) <  Math.abs(deltaYr)){
   // push translation matrix
   if (deltaXr > 0)
     scalar = -1
   angle = scalar * angle
   let rotateX = ([
    1.0 , 0.0 ,            0.0 ,                    0.0,
    0.0 , Math.cos(angle), (-1 *Math.sin(angle)),  0.0,
    0.0 , Math.sin(angle), Math.cos(angle),         0.0,
    0.0 , 0.0 ,            0.0 ,                    1.0
    ])
   for (var i =0 ; i < highlighted.length;i++){
     if (highlighted[i]==1){
       if (roX[i].length < 1){
         roX[i] = angle
       }
       else {
         roX[i] = angle + roX[i]
       }
     }
    }
  }
  // rotate Y
  else if (Math.abs(deltaXr) >  Math.abs(deltaYr)){ 
   // push translation matrix
   if (deltaYr > 0)
     scalar = -1
   angle = scalar * angle
   let rotateY = ([
    Math.cos(angle),        0.0, Math.sin(angle), 0.0,
    0.0,                    1.0, 0.0,             0.0,
    (-1 * Math.sin(angle)), 0.0, Math.cos(angle), 0.0,
    0.0,                    0.0, 0.0,             1.0
    ])
   for (var i =0 ; i < highlighted.length;i++){
     if (highlighted[i]==1){
       if (roY[i].length < 1){
         roY[i] = angle
       }
       else {
         roY[i] = angle + roY[i]
       }
     }
   }
  }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
  previousXr = x
  previousYr = y
}

// using translation matrix to translate on z axis 
function dragM(ev, gl, canvas, a_Position){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  let deltaXm = x - previousXm  
  let deltaYm = y - previousYm 
  let angle = (Math.PI / 6)
  let scalar = 1
  // rotate Z
  if (Math.abs(deltaXm) > Math.abs(deltaYm)){
    if (deltaXm < 0) 
      scalar = -1
    angle = scalar * angle
    let rotateZ = ([
    Math.cos(angle), (-1 * Math.sin(angle)),  0.0, 0.0,
    Math.sin(angle), Math.cos(angle),         0.0, 0.0,
    0.0,             0.0,                     1.0, 0.0,
    0.0,             0.0,                     0.0, 1.0
    ])
    for (var i =0 ; i < highlighted.length;i++){
      if (highlighted[i]==1){
      for (var j = 0 ; j < oldc_points[i].length ; j++){
           oldc_points[i][j] = applyMatrix (oldc_points[i][j],rotateZ)
        }
      }
    }
  }
  // translate Z
  else {
   let deltaX = 0
   let deltaY = 0
   let deltaZ = deltaYm * 5 
   let translation = ([
   1.0 , 0.0 , 0.0 , deltaX,
   0.0 , 1.0 , 0.0 , deltaY,
   0.0 , 0.0 , 1.0 , deltaZ,
   0.0 , 0.0 , 0.0 , 1.0
   ])
   for (var i =0 ; i < highlighted.length;i++){
     if (highlighted[i]==1){
     for (var j = 0 ; j < oldc_points[i].length ; j++){
          oldc_points[i][j] = applyMatrix (oldc_points[i][j],translation)
       }
     }
   }
  }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
  previousXm = x
  previousYm = y
}

function shear(ev, gl, canvas, a_Position){
  console.log("Y SHEAR") 
  let shearY_matrix = 
([ 1.0 , 0.0 , 0.0 , 0.0,
  0.5 , 1.0 , 0.0 , 0.0,
  0.0 , 0.0 , 1.0 , 0.0,
  0.0 , 0.0 , 0.0 , 1.0
  ])
  let count = 0 
  for (var i =0 ; i < highlighted.length;i++){
    if (highlighted[i]==1){
    count = 1
      for (var j = 0 ; j < oldc_points[i].length ; j++){
           oldc_points[i][j] = applyMatrix (oldc_points[i][j],shearY_matrix)
        }
    }
  }
 if (count == 0 ){
   console.log("please highlight a cylinder to SHEAR.")
 }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}
// Main function to deal with Rotating already existing cylinder points.
// Draws Cylinders, CAPs between cylinders, and calls a function to draw surface normals if applicable!!
// same as drawcylinder, except this time works off of cylinder points rather than a polyline
// r = radius 
// s = sides
// expects an input of n cylinder points (66 points by default, (3 points per line* (10 sides + 1) * 2 circles))
// initAllcylinders should be called before calling this
function drawcylinderC(gl,canvas,a_Position,cylinder_points,cylindernormals,s,numcylinder){
  Acolor = 1 - (numcylinder/255)  
  let convert = Math.PI/180 
  let numsides = 360/s
  let colors = []
  let normie = []
  let indices = []
  normie.push((cylindernormals[0]+cylindernormals[27]) / 2)
  normie.push((cylindernormals[1]+cylindernormals[28]) / 2)
  normie.push((cylindernormals[2]+cylindernormals[29]) / 2)
  colors.push(Rcolor)
  colors.push(Gcolor)
  colors.push(Bcolor)
  colors.push(Acolor)
  // the 2nd -> n+1th point 
  // the n+1th point is the same as the first point, added for easier convenience of drawing
  for (var i = 1 ; i < s+1; i++){
   normie.push((cylindernormals[3*i]+cylindernormals[3*(i-1)])/2) 
   normie.push((cylindernormals[3*i+1]+cylindernormals[3*(i-1)+1])/2) 
   normie.push((cylindernormals[3*i+2]+cylindernormals[3*(i-1)+2])/2) 
   colors.push(Rcolor)
   colors.push(Gcolor)
   colors.push(Bcolor)
   colors.push(Acolor)
  }
  // same thing, except for the 2nd circle 
  normie.push((cylindernormals[0]+cylindernormals[27]) / 2)
  normie.push((cylindernormals[1]+cylindernormals[28]) / 2)
  normie.push((cylindernormals[2]+cylindernormals[29]) / 2)
  colors.push(Rcolor)
  colors.push(Gcolor)
  colors.push(Bcolor)
  colors.push(Acolor)
  for (var i = 1 ; i < s+1; i++){
   normie.push((cylindernormals[3*i]+cylindernormals[3*(i-1)])/2) 
   normie.push((cylindernormals[3*i+1]+cylindernormals[3*(i-1)+1])/2) 
   normie.push((cylindernormals[3*i+2]+cylindernormals[3*(i-1)+2])/2) 
   colors.push(Rcolor)
   colors.push(Gcolor)
   colors.push(Bcolor)
   colors.push(Acolor)
  }
  let len = cylinder_points.length/6
  // traiangles that form the cylinder
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
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  initAttrib(gl,canvas,numcylinder)

  //draw the cylinder!
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

// expected input : c_point set , length % 3 = 0 (66 points by default, (3 points per line* (10 sides + 1) * 2 circles))
// transformation matrix to apply (in the format of an length 16 array, each 4 items in the array representing a row in a matrix)
// output : transformed points
function applyMatrix (c_point,matrix){
  let newC = []
  // for (let i = 0 ; i < c_point.length ; i+=3){
  //   newC.push( (c_point[i] * matrix.elements[0]) + (c_point[i+1] * matrix.elements[1]) + (c_point[i+2] * matrix.elements[2]) +(1 * matrix.elements[3]) )
  //   newC.push( (c_point[i] * matrix.elements[4]) + (c_point[i+1] * matrix.elements[5]) + (c_point[i+2] * matrix.elements[6]) +(1 * matrix.elements[7]) )
  //   newC.push( (c_point[i] * matrix.elements[8]) + (c_point[i+1] * matrix.elements[9]) + (c_point[i+2] * matrix.elements[10]) +(1 * matrix.elements[11]) )
  // }
    let t = []  
  for (let i = 0 ; i < c_point.length ; i+=3){
    t=[]
    t.push(c_point[i])
    t.push(c_point[i+1])
    t.push(c_point[i+2])
    t.push(1.0)
    let vec = new Float32Array(t)
    vec = new Vector4(t)
    let topush = matrix.multiplyVector4(vec) 
    newC.push(topush.elements[0])
    newC.push(topush.elements[1])
    newC.push(topush.elements[2])
  }
  return newC
}


function twist(ev, gl, canvas, a_Position){
for (var i =0 ; i < highlighted.length;i++){
   for (var j = 0 ; j < oldc_points[i].length ; j++){
     if (highlighted[i]==1){
        let arrayc1 = oldc_points[i][j]
        let arrayc2 = arrayc1.splice(oldc_points[i][j].length/2,oldc_points[i][j].length)
        let circle1x = oldlines[i][2*j]
        let circle1y = oldlines[i][2*j+1]
        let circle2x = oldlines[i][2*j+2]
        let circle2y = oldlines[i][2*j+3]
        let untranslate1 = ([
        1.0 , 0.0 , 0.0 , -1 * circle1x,
        0.0 , 1.0 , 0.0 , -1 * circle1y,
        0.0 , 0.0 , 1.0 , 0,
        0.0 , 0.0 , 0.0 , 1.0
        ])
        let untranslate2 = ([
        1.0 , 0.0 , 0.0 , -1 * circle2x,
        0.0 , 1.0 , 0.0 , -1 * circle2y,
        0.0 , 0.0 , 1.0 , 0,
        0.0 , 0.0 , 0.0 , 1.0
        ])
        arrayc1 = applyMatrix (arrayc1,untranslate1)
        arrayc2 = applyMatrix (arrayc2,untranslate2)
        let untranslatedA = arrayc1.concat(arrayc2)
        arrayc1 = untranslatedA
        arrayc2 = arrayc1.splice(untranslatedA.length/2,untranslatedA.length)
        let angle = Math.PI / 3
        let translate1 = ([
         1.0 , 0.0 ,            0.0 ,                    0.0,
         0.0 , Math.cos(angle), Math.sin(angle),  0.0,
         0.0 , (-1 * Math.sin(angle)), Math.cos(angle),         0.0,
         0.0 , 0.0 ,            0.0 ,                    1.0
         ])
        let translate2 = ([
         1.0 , 0.0 ,            0.0 ,                    circle2x,
         0.0 , Math.cos(-1 * angle), Math.sin(-1 * angle),  circle2y,
         0.0 , (Math.sin(angle)), Math.cos(-1 * angle),         0.0,
         0.0 , 0.0 ,            0.0 ,                    1.0
         ])
         arrayc1 = applyMatrix (arrayc1,translate1)
         arrayc2 = applyMatrix (arrayc2,translate2)
         let translatedA = arrayc1.concat(arrayc2)
         oldc_points[i][j] = translatedA
      }
    }
  }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}
