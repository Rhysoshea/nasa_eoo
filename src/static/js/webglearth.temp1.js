var gl;
var pwgl = {
};

pwgl.ongoingImageLoads = [];
var canvas;
// Variables for interactive control
var transY = 0, transZ = 0;
var xRot = yRot = zRot = xOffs = yOffs = drag = 0;
pwgl.listOfPressedKeys = []; // Keep track of pressed down keys in a list
var lastTime = 0;


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


var vertexShaderSrc = 'attribute vec3 coordinates;' + 
                      'void main(void) {' +
                      ' gl_Position = vec4(coordinates, 1.0);' + 
                      '}';

var fragmentShaderSrc = 'void main(void) {' + 
                        ' gl_FragColor = vec4(0, 0, 0, 1);' + 
                        '}';




function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function setupShaders() {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSrc);
    gl.compileShader(vertexShader);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSrc);
    gl.compileShader(fragmentShader);
    // check shaders compiled
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
        alert("Could not compile vertex shader: " + gl.getShaderInfoLog(vertexShader));
    }
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert("Could not compile vertex shader: " + gl.getShaderInfoLog(fragmentShader));
    }

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders " + gl.getProgramInfoLog(shaderProgram));
    }

    // var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    gl.useProgram(shaderProgram);
    // gl.enableVertexAttribArray(positionAttributeLocation);

    // pwgl.vertexPositionAttributeLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    // gl.enableVertexAttribArray(pwgl.vertexPositionAttributeLoc);
    // pwgl.vertexTextureAttributeLoc = gl.getAttribLocation(shaderProgram, "aTextureCoordinates");
    // gl.enableVertexAttribArray(pwgl.vertexTextureAttributeLoc);
    // pwgl.vertexNormalAttributeLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    // gl.enableVertexAttribArray(pwgl.vertexNormalAttributeLoc);
    // pwgl.uniformProjMatrixLoc = gl.getUniformLocation(shaderProgram, "uPMatrix");
    // pwgl.uniformMVMatrixLoc = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    // pwgl.uniformNormalMatrixLoc = gl.getUniformLocation(shaderProgram, "uNMatrix");
    // pwgl.uniformSamplerLoc = gl.getUniformLocation(shaderProgram, "uSampler");
    // pwgl.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram,
    //     "uLightPosition");
    // pwgl.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram,
    //     "uAmbientLightColor");
    // pwgl.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram,
    //     "uDiffuseLightColor");
    // pwgl.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram,
    //     "uSpecularLightColor");
    // pwgl.uniformSpotDirectionLoc = gl.getUniformLocation(shaderProgram, "uSpotDirection");
    // pwgl.modelViewMatrix = mat4.create();
    // pwgl.modelViewMatrixStack = [];
    // pwgl.projectionMatrix = mat4.create();
}


function setupOrbitBuffers() {

    orbitBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, orbitBuffer);

    const positions = [
        0, 0,
         0, 0.5,
        0.7, 0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, 
                  new Float32Array(positions),
                  gl.STATIC_DRAW);

}




function setupBuffers() {
    setupOrbitBuffers();
}



function drawOrbit() {

    const positions = [];

    var r = 10;

    var center = (0, 0);
    positions.push(center);
    const colors = [
        0.0, 0.0, 0.0, 1.0,
    ]

    const stops = 100;

    for (i=0; i<stops; i++){
        positions.push( center + (
            (r*Math.cos(i * 2 * Math.PI / stops)),
            (r*Math.sin(i * 2 * Math.PI / stops))
        ));

    }

    var offset = 0;
    var count = 3;

    console.log(positions);
    // console.log(colors);
    gl.drawArrays(gl.TRIANGLES, offset, count);
}


var newAngle = 0;
function draw() {
    // var currentTime = Date.now();

    // yRot = xRot = zRot = transY = transZ = 0;

    // gl.uniform1i(pwgl.uniformSamplerLoc, 0);
    // var timeNow = new Date().getTime();
    // if (lastTime != 0) {
    //     var elapsed = timeNow - lastTime;
    //     newAngle += (90 * elapsed) / 1000;
    // }
    // lastTime = timeNow;
    // var rotationSpeed = -degToRad(newAngle) / 50; // Sets earth rotation speed 
    // if (currentTime === undefined) {
    //     currentTime = Date.now();
    // }

    // if (pwgl.animationStartTime === undefined) {
    //     pwgl.animationStartTime = currentTime;
    // }

    // pwgl.angle = (currentTime - pwgl.animationStartTime) / pwgl.orbitalMultipler * 2 * Math.PI % (2 * Math.PI); // determines where in the orbit the satellite should be at a given time
    // pwgl.x = Math.cos(pwgl.angle) * pwgl.circleRadius;
    // pwgl.z = Math.sin(pwgl.angle) * pwgl.circleRadius;


    // const offset = 0;
    // const vertexCount = 4;
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
    setupShaders();
    setupBuffers();

    // Transparent canvas for space background image
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    pwgl.x = 0.0;
    pwgl.y = 0.0;
    pwgl.z = 0.0;
    pwgl.circleRadius = 100.0; // radius of satellite around Earth
    pwgl.orbitalMultipler = 2000;
    pwgl.satMultiplier = 1; // spin of satellite


}

