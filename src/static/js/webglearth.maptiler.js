var gl;
var pwgl = {
};

pwgl.ongoingImageLoads = [];
var canvas;
// Variables for interactive control
var transY = 0, transZ = 0;
var xRot = yRot = zRot = xOffs = yOffs = drag = 0;
pwgl.listOfPressedKeys = [];
var lastTime = 0;
// Keep track of pressed down keys in a list
function createGLContext(canvas) {
    var names = ["webgl", "experimental-webgl"];
    var context = null;
    for (var i = 0; i < names.length; i++) {
        try {
            context = canvas.getContext(names[i]);
        }
        catch (e) {
        }
        if (context) {
            break;
        }
    }
    if (context) {
        context.viewportWidth = canvas.width;
        context.viewportHeight = canvas.height;
    }
    else {
        alert("Failed to create WebGL context!");
    }
    return context;
}



function degToRad(degrees) {
    return degrees * Math.PI / 180;
}



function setupOrbitBuffers() {

    orbitBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, orbitBuffer);

    const positions = [
        -1.0, 1.0,
         1.0, 1.0,
        -1.0, -1.0,
         1.0, -1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, 
                  new Float32Array(positions),
                  gl.STATIC_DRAW);

}




function setupBuffers() {
    setupOrbitBuffers();
}



function drawOrbit() {

    const positions = [
        0.0, 0.0
    ]

    const colors = [
        1.0, 1.0, 1.0, 1.0,
    ]

    const stops = 100;

    for (i=0; i<stops; i++){
        positions.push(Math.cos(100*i*2*Math.PI/stops));
        positions.push(Math.sin(100*i*2*Math.PI/stops));
        colors.push(1.0, 1.0, 1.0, 1.0)
    }

    // console.log(positions);
    // console.log(colors);
    gl.drawElements(gl.TRIANGLES, 101, gl.DOUBLE, 0);
}


var newAngle = 0;
function draw() {
    var currentTime = Date.now();



    yRot = xRot = zRot = transY = transZ = 0;

    gl.uniform1i(pwgl.uniformSamplerLoc, 0);
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        newAngle += (90 * elapsed) / 1000;
    }
    lastTime = timeNow;
    var rotationSpeed = -degToRad(newAngle) / 50; // Sets earth rotation speed 
    if (currentTime === undefined) {
        currentTime = Date.now();
    }

    if (pwgl.animationStartTime === undefined) {
        pwgl.animationStartTime = currentTime;
    }

    pwgl.angle = (currentTime - pwgl.animationStartTime) / pwgl.orbitalMultipler * 2 * Math.PI % (2 * Math.PI); // determines where in the orbit the satellite should be at a given time
    pwgl.x = Math.cos(pwgl.angle) * pwgl.circleRadius;
    pwgl.z = Math.sin(pwgl.angle) * pwgl.circleRadius;


    const offset = 0;
    const vertexCount = 4;
    drawOrbit();
}

function startup() {
    var canvas = document.getElementById("myCanvas");
    canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
    gl = createGLContext(canvas);
    init();
    draw();
}

var relation = 1.6 / 2500;
function init() {
    // Initialization that is performed during first startup and when the
    // event webglcontextrestored is received is included in this function.
    // setupShaders();
    setupBuffers();

    // Transparent canvas for space background image
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    pwgl.x = 0.0;
    pwgl.y = 0.0;
    pwgl.z = 0.0;
    pwgl.circleRadius = 10.0; // radius of satellite around Earth
    pwgl.orbitalMultipler = 2000;
    pwgl.satMultiplier = 1; // spin of satellite


}

