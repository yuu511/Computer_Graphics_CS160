// elijah cordova 1425119
var VSHADER_SOURCE = null; // vertex shader program
var FSHADER_SOURCE = null; // fragment shader program

// All line segments, used to initialize cylinders
// array of arrays ex: oldlines[0] = line segment 0 
// A line segment = a cluster of cylinders
// ex: inside of oldlines[0]: [x1,y1 ,x2,y2, x3,y3] -> 2 cylinders: 
// cylinder 1 has faces with center x1y1 x2y2 and cylinder 2 has faces with center x2y2 x3y3
let oldlines = [] 

// Defaul color of object specified in R,G,B,A(red)
// (x)Color = current color setting, oldcolors = all old colors (an array of arrays)
let Rcolor = 1
let Gcolor = 0
let Bcolor = 0
let Acolor = 1

// cylinder_points = currently drawing cylinder points
// sides = number of size the cylinder will have , radius = defualt radius
let cylinder_points = []
let sides = 20
let radius = 0.20 

//Position of light 1, default 1,1,1
let light1X = 1.0
let light1Y = 1.0
let light1Z = 1.0
// mode ( deprecated )
// 2 = phong 3 = rim 4 = toon 5 = depth
let mode = 2

// ambient / specular color settings
let ambientR = 0.0
let ambientG = 0.0
let ambientB = 0.2
let currentspecularR = 0.0
let currentspecularG = 0.8
let currentspecularB = 0.0
// glossiness of specular highlights
let glossiness = 10.0

// lab5 stuff (projection + selection)
// highlighted[i]= 1  -> cylinder cluster i is selected
let highlighted = []
// thinking[i]= 1  -> cylinder cluster i is being hovered on 
let thinking = []
let eyeX = 0
let eyeY = 0
let eyeZ = 2
let centerX = 0
let centerY = 0
let centerZ = 0
let nP = 1
let orthomode = -1
let ANGLE_STEP = 0.0

//lab6 stuff (translations)
// oldc_points = all current cylinder points, arranged in array of arrays
// e.x. oldc_points [i][j] = cluster (group of cylinders in a single line segment) i , cylinder j  of cluster i

// all initial cylinder points (oldc_points) and normals (oldc_normals)
let oldc_points = []
let oldc_normals = []
// temp arrays to store individual lines/points
let oldc_line = []
let oldc_normals_line = []

// refrence for left drag
let previousX = null
let previousY = null 


// scale, translate, translate(z), rotate X, rotate Y, rotate Z values

// scale matrices: stored as an array, holds a single number representing how much a cluster of cylinders is scaled. 
// ex: sc[i] = 1.1 -> cluster i is scaled by 1.1
let sc = []

// holds how much a cluster is translated by x,y. Same as scale, but extra paramaters to represent x,y.
// ex: transl[i][0]= 20,transl[i][1] = 10-> shift cluster i by x +20 and y +10 
let transl = []

// same as above, except for z. holds a single value (no extra parameters) 
// ex: transz[i]= - 1 -> translate cluster i by z -1 
let transz = []

// rotate X,Y,Z matrices: holds a single number to represent how much a cluster is rotated
// ex : roX [i] = 20 -> rotate cluster i by 20
let roX = []
let roY = []
let roZ = []

// similar to above, stores how much to twist / shear a specific cluster
let twst = []
let shr = []

// Toggle variables. 1 = true
// CUBEMODE = cube movement
let CUBEMODE = 0
// FALLDOWN = falling down movement 
let FALLDOWN = -1
// toggle animation (continuous drawing of canvas) 
let tickB = 0
// reference for last time animation is called
let g_last = Date.now()

// refrence = the base circle : a circle at center 0,0 rotate around the X axis. All cylinders are built off of this circle
let reference = []

// all_old_angles : how much a cylinder is rotated during the initialization process.
// ex: a completely vertical cylinder with faces at center(0,0) -> (0,1) is requested.
// our initial faces (reference) are circles with center 0,0 rotated around the x axis
// we need to rotate the cylinder along the z axis 90 degrees that the circles allign with the y axis.
// stored as an array of an arrays. ex:all_old_angles[i][j] = 90 -> cylinder j of 
// cylinder cluster i is rotated 90 degrees along the z axis relative to the base circle (which is rotated along the x axis)
let all_old_angles = []
let individual_angles = []

// convertednormals = normals for each individual cylinder AFTER applying all transfromation matrices
// stored as an array of arrays
let convertednormals = []
// model_matrices = the appropriate transformation matrices, stored in an array of arrays
let model_matrices = []

//lab7 stuff (Camera rotations)
let viewM = new Matrix4()
let rotDeg = 0
let rotX = 0
let rotY= 0
let rotZ = 1
let upX = 0
let upY = 1.0
let upZ = 0
let xpan = 0
let ypan = 0
let forwb = 0
let FOV = 50

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

  // generalized cylinder cluster 1
  let init = []
  // init.push (-0.7)
  // init.push (-0.2)
  // init.push (0.7)
  // init.push (-0.7)
  // init.push (0.5)
  // init.push (1.0)
  init.push (0.5)
  init.push (-0.6)
  init.push (0.5)
  init.push (1.0)
  oldlines.push(init) 
  
  let init2=[]
  init2.push (-0.5)
  init2.push (-0.6)
  init2.push (-0.7)
  init2.push (1.0)
  oldlines.push(init2)
  // initialize translation matrices / highlighting arrays
  for (var i =0 ; i < oldlines.length; i++){
    highlighted.push(0)
    thinking.push(0)
    roX.push(0.0)
    roY.push(0.0)
    roZ.push(0.0)
    sc.push(0)
    transl.push([0.0,0.0])
    transz.push(0.0)
    twst.push(0.0)
    shr.push(0.0)
    model_matrices.push(new Matrix4())
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
  // square movement
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
        eyeZ = 6
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
      }
  }
  // lab7
  if (ev.which == "p".charCodeAt(0)){
    rotXY(ev, gl, canvas, a_Position)
  }

  //pan
  if (ev.which == "h".charCodeAt(0)){
    pan(ev, gl, canvas, a_Position)
  }
  if (ev.which == "j".charCodeAt(0)){
    pan(ev, gl, canvas, a_Position)
  }
  if (ev.which == "k".charCodeAt(0)){
    pan(ev, gl, canvas, a_Position)
  }
  if (ev.which == "l".charCodeAt(0)){
    pan(ev, gl, canvas, a_Position)
  }

  // forward back
  if (ev.which == "y".charCodeAt(0)){
    forwardback(ev, gl, canvas, a_Position)
  }
  if (ev.which == "u".charCodeAt(0)){
    forwardback(ev, gl, canvas, a_Position)
  }
 
  //zoom
  if (ev.which == "i".charCodeAt(0)){
    zoom(ev, gl, canvas, a_Position)
  }
  if (ev.which == "o".charCodeAt(0)){
    zoom(ev, gl, canvas, a_Position)
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

// our main function for handling the right click event (translation)
function rightclick (ev,gl,canvas,a_Position){   
  let x = ev.clientX; // x coordinate of a mouse pointer
  let y = ev.clientY; // y coordinate of a mouse pointer
  let rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  console.log(x + " " + y + " right click\n")
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

// our main function for implementing highlighting
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


// simple function to draw initialize all cylinders based on all established line segments
// vertices are storred in an array of arrays, where the index is the polyline  [(x,y),(x,y)],[(x,y),(x,y)] ]
function initAllCylinders(gl,canvas,a_Position){
  // draw all finished cylinder 
  oldc_points = []
  oldc_normals = []
  all_old_angles = []
  convertednormals=[]
  for (var i =0 ; i < oldlines.length ; i++){       
    individual_angles = []
    convertednormals.push([])
    if (oldlines[i].length >= 4){
     var loop = ((oldlines[i].length/2)-1)
     for (var j =0; j < loop;j++){    
      convertednormals[i].push([])
      initcylinder(gl,canvas,a_Position,radius,sides,oldlines[i][2*j],oldlines[i][2*j+1],oldlines[i][2*j+2],oldlines[i][2*j+3],i)
     }
     all_old_angles.push(individual_angles)
     oldc_points.push(oldc_line)
     oldc_normals.push(oldc_normals_line) 
     oldc_line = []
     oldc_normals_line = []
    }
  }  
}

// simple function to draw all cylinders given untranslated cylinder points /normals
function draw_All(gl,canvas,a_Position,all_cylinder_points,all_cylinder_normals){
  // performs all of the necessary operations
  c_normal = translate_All(gl,canvas,a_Position,all_cylinder_points,all_cylinder_normals)
  for (var i =0 ; i < oldc_points.length ; i++){       
     if (oldc_points[i].length >= 1){
       for (var j =0; j < oldc_points[i].length ; j++){
         drawcylinderC(gl,canvas,a_Position,oldc_points[i][j],c_normal[i][j],sides,i,model_matrices[i])
       }
     }
  }  
}

// calculates a transformation matrix
// applies the transformation matrix to all of the cylinder points
// returns the normals of translated cylinder points
function translate_All(gl,canvas,a_Position,cylinder_points,cylinder_normals){
  let scMatrices = []
  let trMatrices = []
  let roXMatrices = []
  let roYMatrices = []
  let roZMatrices = []
  let old_rotate = []
  let old_translate = []
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
  for (var k=0 ; k < roZ.length ; k++){
    if(roZ[k] == 0){
      roZMatrices.push(identitym)
    }
    else {
      let rotateZ = new Matrix4().rotate(roZ[k],0,0,1)
      roZMatrices.push(rotateZ)
    }
  }

  // translate 
  for (var i=0; i < transl.length; i++){
    let toTr = new Matrix4().translate(transl[i][0],transl[i][1],transz[i])
    trMatrices.push(toTr)
  } 

  // old translations,(what we did to the cylinder initially) 
  // initial rotate angle along z 
  for (var i = 0 ; i < all_old_angles.length ; i++){
    let t = []
    for (var j = 0 ; j < all_old_angles[i].length ; j++){
      let rotateZ = new Matrix4().rotate(all_old_angles[i][j],0,0,1)
      t.push(rotateZ)
    }
    old_rotate.push(t)
  }
 

  // initial old translate
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

  // copy the original circle rotated around x (center 0,0 , rot x)
  let base = JSON.parse(JSON.stringify(reference))
  // copy the current cylinder_points / cylinder normals
  let c_p = JSON.parse(JSON.stringify(cylinder_points))
  let c_n = JSON.parse(JSON.stringify(cylinder_normals))
  let initRotate = []
  let test = []

  // apply matrices
  for (var i = 0 ; i < cylinder_points.length ; i++){
    for (var j = 0 ; j < cylinder_points[i].length  ; j++){
      let origin = new Matrix4()
      origin.setInverseOf(old_translate[i][0][0])
      let C1 = new Matrix4()

      // shearing
      if (shr[i]!=0){
        let shrM = new Matrix4()
        shrM.setIdentity()
        shrM.elements[4]=shrM.elements[4]+ (shr[i])
        shrM.elements[8]=shrM.elements[8]+ (shr[i])
        C1= new Matrix4(C1.concat(shrM))
      }

      //main translations
      C1 = new Matrix4(C1.concat(trMatrices[i]))
      C1 = new Matrix4(C1.concat(old_translate[i][0][0]))
      C1 = new Matrix4(C1.concat(roZMatrices[i]))
      C1 = new Matrix4(C1.concat(roYMatrices[i]))
      C1 = new Matrix4(C1.concat(roXMatrices[i]))
      C1 = new Matrix4(C1.concat(origin))
      C1 = new Matrix4(C1.concat(old_translate[i][j][0]))
      C1 = new Matrix4(C1.concat(old_rotate[i][j]))
      C1 = new Matrix4(C1.concat(scMatrices[i]))


      //twisting ( rotate 1 circle more than the other)
      if (twst[i]!=0){
        let twistM = new Matrix4().rotate(twst[i]*60,1,0,0)
        C1 = new Matrix4(C1.concat(twistM))
      }

      let C2 = new Matrix4()
      // main translations
      if (shr[i]!=0){
        let shrM = new Matrix4()
        shrM.setIdentity()
        shrM.elements[4]=shrM.elements[4]+ (shr[i])
        shrM.elements[8]=shrM.elements[8]+ (shr[i])
        C2= new Matrix4(C2.concat(shrM))
      }
      C2 = new Matrix4(C2.concat(trMatrices[i]))
      C2 = new Matrix4(C2.concat(old_translate[i][0][0]))
      C2 = new Matrix4(C2.concat(roZMatrices[i]))
      C2 = new Matrix4(C2.concat(roYMatrices[i]))
      C2 = new Matrix4(C2.concat(roXMatrices[i]))
      C2 = new Matrix4(C2.concat(origin))
      C2 = new Matrix4(C2.concat(old_translate[i][j][1]))
      C2 = new Matrix4(C2.concat(old_rotate[i][j]))
      C2 = new Matrix4(C2.concat(scMatrices[i]))


      let circle_one = applyMatrix(base,C1,1)
      let circle_two = applyMatrix(base,C2,1)
      let full = circle_one.concat(circle_two)
      c_p[i][j] = full
       

      //CALCULATE NEW NORMALS USING INVERSE TRANSPOSE
      let M2 = new Matrix4
          M2.set (trMatrices[i])
         // M2 = new Matrix4(M2.concat(old_translate[i][0][0]))
          M2 = new Matrix4(M2.concat(roZMatrices[i]))
          M2 = new Matrix4(M2.concat(roYMatrices[i]))
          M2 = new Matrix4(M2.concat(roXMatrices[i]))
    
      model_matrices[i] = new Matrix4(M2)
      //twisting ( rotate 1 circle more than the other)
      if (twst[i]!=0){
        let twistM = new Matrix4().rotate(twst[i]*60,1,0,0)
        C1 = new Matrix4(C1.concat(twistM))
      }
      if (shr[i]!=0){
        let shrM = new Matrix4()
        shrM.setIdentity()
        shrM.elements[4]=shrM.elements[4]+ (shr[i])
        shrM.elements[8]=shrM.elements[8]+ (shr[i])
        C1= new Matrix4(C1.concat(shrM))
      }
          // M2 = new Matrix4(M2.concat(scMatrices[i]))
      let Invert = new Matrix4()
      Invert.setInverseOf(M2)
      Invert.transpose()
      convertednormals[i][j] = applyMatrix(cylinder_normals[i][j],Invert,0.0)
      // let viewM = new Matrix4().translate(xpan,ypan,forwb)
      // c_p[i][j]= applyMatrix(c_p[i][j],viewM,1.0)
    }
  }   
  // apply the changes
  oldc_points = c_p
  return convertednormals 
}

// initialize all cylinder
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
 
  individual_angles.push(-1 * ((degreeToRotate * 180) / Math.PI))
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

     Q.push(cylinder_points[3*i])
     Q.push(cylinder_points[3*i+1])
     Q.push(cylinder_points[3*i+2])

     R.push(cylinder_points[3*i+3])
     R.push(cylinder_points[3*i+4])
     R.push(cylinder_points[3*i+5])

     S.push(cylinder_points[3*i+(cylinder_points.length/2)])
     S.push(cylinder_points[3*i+(cylinder_points.length/2)+1])
     S.push(cylinder_points[3*i+(cylinder_points.length/2)+2]) 
     

     QR.push(Q[0]-R[0]) 
     QR.push(Q[1]-R[1]) 
     QR.push(Q[2]-R[2])

     QS.push(Q[0]-S[0]) 
     QS.push(Q[1]-S[1]) 
     QS.push(Q[2]-S[2])

     // the surface normal vector is calculated by QR x QS which is perpendicular to the plane
     // use normalize to find the unit vector
     cross = normalize(findCross(QR,QS))
     cylindernormals.push(cross[0])
     cylindernormals.push(cross[1])
     cylindernormals.push(cross[2])
  }
  // push the n+1th normal ( we have n+1 sides to make drawing easier)
  cylindernormals.push(cylindernormals[0])
  cylindernormals.push(cylindernormals[1])
  cylindernormals.push(cylindernormals[2])
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

function initAttrib(gl,canvas,numpolyline, currmodel) {
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
    var u_exponent = gl.getUniformLocation(gl.program, 'u_exponent')
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix')
    var u_ProjMatrix= gl.getUniformLocation(gl.program, 'u_ProjMatrix')
    if (!u_DiffuseLightF || !u_LightPositionF || !u_AmbientLightF || !u_SpecularLightF || !u_ViewPositionF || !u_exponent || !u_ViewMatrix) { 
      console.log('Failed to get the storage location');
      console.log(u_DiffuseLightF)
      console.log(u_LightPositionF)
      console.log(u_AmbientLightF)
      console.log(u_SpecularLightF)
      console.log(u_ViewPositionF)
      console.log(u_exponent)
      console.log(u_ViewMatrix)
      return;
    } 

   
   // var modelMatrix = new Matrix4();  // Model matrix
   // var mvpMatrix = new Matrix4();    // Model view projection matrix
   // var normalMatrix = new Matrix4(); // Transformation matrix for normals
   var viewMatrix = new Matrix4()
   var projMatrix = new Matrix4()
   // // let viewM = new Matrix4().translate(xpan,ypan,forwb)
   // // Calculate the model matrix
   // modelMatrix.setRotate(rotDeg, rotX, rotY, rotZ) // Rotate around the y-axis

   // // Calculate the view projection matrix
   projMatrix.setPerspective(FOV, canvas.width/canvas.height, nP, 10)
   viewMatrix.setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
   // mvpMatrix.multiply(projMatrix)
   // mvpMatrix.multiply(viewMatrix)
   // mvpMatrix.multiply(modelMatrix)

  
   // // Pass the model matrix to u_ModelMatrix
   // gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

   // // Pass the model matrix to u_ModelMatrix
   // gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

   // // Pass the model view projection matrix to u_mvpMatrix
   // gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Set the view matrix
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    // Set the view matrix
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
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
       transl[i][0] = transl[i][0] + deltaX
       transl[i][1] = transl[i][1] + deltaY
       transl[i][2] = transl[i][2] + deltaZ
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
function scaleradius(ev, gl, canvas, a_Position){
  let scale = 1.0
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
  let scalar = 1
  let angle = 15
  // rotate X
  if (Math.abs(ev.movementX) < Math.abs(ev.movementY) || ev.movementX == undefined){
   // push translation matrix
   if (ev.movementY < 0)
     scalar = -1
   angle = scalar * angle
   for (var i =0 ; i < highlighted.length;i++){
     console.log("rotate X!")
     if (highlighted[i]==1){
       if (roX[i] == 0){
         roX[i] = angle
       }
       else {
         roX[i] = angle + roX[i]
       }
     }
    }
  }
  // rotate Y
  else if (Math.abs(ev.movementX) > Math.abs(ev.movementY) || ev.movementY == undefined) { 
   // push translation matrix
     console.log("rotate Y!")
   if (ev.movementX < 0)
     scalar = -1
   angle = scalar * angle
   for (var i =0 ; i < highlighted.length;i++){
     if (highlighted[i]==1){
       if (roY[i] == 0){
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
}

// accumulate how much to rotate z, translate z
function dragM(ev, gl, canvas, a_Position){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect() ;
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  let angle = 15
  let scalar = 1
  // rotate Z
  if (Math.abs(ev.movementX) > Math.abs(ev.movementY) || ev.movementY == undefined){
    if (ev.movementX > 0) 
      scalar = -1
    angle = scalar * angle
   for (var i =0 ; i < highlighted.length;i++){
     console.log("rotate Z!")
     if (highlighted[i]==1){
       if (roZ[i] == 0){
         roZ[i] = angle
       }
       else {
         roZ[i] = angle + roZ[i]
       }
     }
   }
  }
  // translate Z
  else if (Math.abs(ev.movementX) < Math.abs(ev.movementY) || ev.movementX == undefined) {
   console.log("Translate Z!")
   let deltaZ = ev.movementY * 0.08
   for (var i =0 ; i < highlighted.length;i++){
     if (highlighted[i]==1){
       transz[i] = transz[i] + deltaZ
     }
   }
  }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}

// Draws Cylinders, CAPs between cylinders, and calls a function to draw surface normals if applicable!!
// same as drawcylinder, except this time works off of cylinder points rather than a polyline
// r = radius 
// s = sides
// expects an input of n cylinder points (66 points by default, (3 points per line* (10 sides + 1) * 2 circles))
// initAllcylinders should be called before calling this
function drawcylinderC(gl,canvas,a_Position,cylinder_points,cylindernormals,s,numcylinder,m_matrix){
  Acolor = 1 - (numcylinder/255)  
  let convert = Math.PI/180 
  let numsides = 360/s
  let colors = []
  let normie = []
  let indices = [] 
 
  // we calculate normals by taking the average of normals at the vertex
  // start by calculating the average of the 1st and last point 
  // the index of the nth point is actually the 2nd to last set in the cylindernormals array:
  // the last set of points are the normals of the first point (to make looping easier)
  normie.push((cylindernormals[0]+cylindernormals[cylindernormals.length-6]) / 2)
  normie.push((cylindernormals[1]+cylindernormals[cylindernormals.length-5]) / 2)
  normie.push((cylindernormals[2]+cylindernormals[cylindernormals.length-4]) / 2)
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
  normie.push((cylindernormals[0]+cylindernormals[cylindernormals.length-6]) / 2)
  normie.push((cylindernormals[1]+cylindernormals[cylindernormals.length-5]) / 2)
  normie.push((cylindernormals[2]+cylindernormals[cylindernormals.length-4]) / 2)
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
  initAttrib(gl,canvas,numcylinder,m_matrix)

  //draw the cylinder!
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);

}

// expected input : c_point set , length % 3 = 0 (66 points by default, (3 points per line* (10 sides + 1) * 2 circles))
// factor = value of the 4th element (used for converting vec4 ->vec3 
// transformation matrix to apply (in the format of an length 16 array, each 4 items in the array representing a row in a matrix)
// output : transformed points
function applyMatrix (c_point,matrix,factor){
  let newC = []
  let t = []  
  for (let i = 0 ; i < c_point.length ; i+=3){
    t=[]
    t.push(c_point[i])
    t.push(c_point[i+1])
    t.push(c_point[i+2])
    t.push(factor)
    let vec = new Float32Array(t)
    vec = new Vector4(t)
    let topush = matrix.multiplyVector4(vec) 
    newC.push(topush.elements[0])
    newC.push(topush.elements[1])
    newC.push(topush.elements[2])
  }
  return newC
}

// Accumulate how much to twist a specific cylinder cluster
function twist(ev, gl, canvas, a_Position){
   for (var i =0 ; i < highlighted.length;i++){
     if (highlighted[i]==1){
       twst[i] = twst[i] + 2
     }
   }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}

// Accumulate how much to shear a specific cylinder cluster
function shear(ev, gl, canvas, a_Position){
   for (var i =0 ; i < highlighted.length;i++){
     if (highlighted[i]==1){
       shr[i] = shr[i] + 1
     }
   }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}

//rotate camera along xy
// eyeX = 0
// eyeY = 0
// eyeZ = 2
// centerX = 0
// centerY = 0
// centerZ = 0
// nP = 1
// mvpMatrix.setPerspective(60, canvas.width/canvas.height, nP, 10)
function rotXY(ev, gl, canvas, a_Position){
  rotX = 0
  rotY = 1
  rotZ = 0
  rotDeg= (rotDeg % 360) - 5
  console.log(rotDeg)
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}

function rotXY(ev, gl, canvas, a_Position){
  rotX = 0
  rotY = 1
  rotZ = 0
  rotDeg= (rotDeg % 360) - 5
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}

// pan camera
function pan(ev, gl, canvas, a_Position){
  // move left
  if (ev.key=='h'){
   eyeX = eyeX + 0.1
   centerX = centerX + 0.1
  }
  if (ev.key=='j'){
   centerY = centerY + 0.1
   eyeY = eyeY + 0.1
  }
  if (ev.key=='k'){
   centerY = centerY - 0.1
   eyeY = eyeY - 0.1
  }
  if (ev.key=='l'){
   centerX = centerX - 0.1
    eyeX = eyeX - 0.1
  }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}

function forwardback(ev, gl, canvas, a_Position){
  if (ev.key=='y'){
    forwb = forwb - 0.1
  }
  if (ev.key=='u'){
    forwb = forwb + 0.1
  }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}

// zoom camera
function zoom(ev, gl, canvas, a_Position){
  if (ev.key=='i'){
    FOV = FOV - 1
  }
  if (ev.key=='o'){
    FOV = FOV + 1
  }
  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  draw_All(gl,canvas,a_Position,oldc_points,oldc_normals)
}
