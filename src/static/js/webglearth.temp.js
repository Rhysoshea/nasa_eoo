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

var vertexShaderSrc =
    "attribute vec3 aVertexPosition;" +
    "attribute vec3 aVertexNormal;" +
    "attribute vec2 aTextureCoordinates;" +
    "uniform mat4 uMVMatrix;" +
    "uniform mat4 uPMatrix;" +
    "uniform mat3 uNMatrix;" +
    "varying vec2 vTextureCoord;" +
    "varying vec3 vNormalEye;" +
    "varying vec3 vPositionEye3;" +
    "void main() {" +
    // Get vertex position in eye coordinates and send to the fragment shader
    "vec4 vertexPositionEye4 = uMVMatrix * vec4(aVertexPosition, 1.0);" +
    "vPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;" +
    // Transform the normal to eye coordinates and send to fragment shader
    "vNormalEye = normalize(uNMatrix * aVertexNormal);" +
    // Transform the geometry
    "gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);" +
    "vTextureCoord = aTextureCoordinates;" +
    "}"
    ;

var fragmentShaderSrc =
    "precision mediump float;" +
    "varying vec2 vTextureCoord;" +
    "varying vec3 vNormalEye;" +
    "varying vec3 vPositionEye3;" +

    "uniform vec3 uAmbientLightColor;" +
    "uniform vec3 uDiffuseLightColor;" +
    "uniform vec3 uSpecularLightColor;" +
    "uniform vec3 uLightPosition;" +
    "uniform vec3 uSpotDirection;" +
    "uniform sampler2D uSampler;" +

    "const float shininess = 5.0;" +
    "const float spotExponent = 80.0;" +
    // cutoff angle of spot light
    "const float spotCosCutoff = 0.97;" + // corresponds to 14 degrees

    "vec3 lightWeighting = vec3(0.0, 0.0, 0.0);" +

    "void main() {" +
    // Calculate the vector (L) to the light source. 
    "vec3 vectorToLightSource = normalize(uLightPosition - vPositionEye3);" +

    // Calculate N dot L for diffuse lighting
    "float diffuseLightWeighting = max(dot(vNormalEye," +
    "vectorToLightSource), 0.0);" +

    // Only do spot and specular light calculations if we have diffuse light term.
    "if (diffuseLightWeighting > 0.0) {" +
    "float spotEffect = dot(normalize(uSpotDirection)," +
    "normalize(-vectorToLightSource));" +

    "if (spotEffect > spotCosCutoff) {" +
    "spotEffect = pow(spotEffect, spotExponent);" +

    "vec3 reflectionVector = normalize(reflect(-" +
    "vectorToLightSource,vNormalEye));" +

    // Calculate view vector (V) 
    "vec3 viewVectorEye = -normalize(vPositionEye3);" +
    "float rdotv = max(dot(reflectionVector, viewVectorEye), 0.0);" +
    "float specularLightWeighting = pow(rdotv, shininess);" +
    "lightWeighting =" +
    "spotEffect * uDiffuseLightColor * diffuseLightWeighting +" +
    "spotEffect * uSpecularLightColor * specularLightWeighting;" +
    "}" +
    "}" +

    // Add the ambient light
    "lightWeighting += uAmbientLightColor;" +

    "vec4 texelColor = texture2D(uSampler, vTextureCoord);" +

    // Modulate texel color with lightweighting and write as final color
    "gl_FragColor = vec4(lightWeighting.rgb * texelColor.rgb, texelColor.a);" +
    "}"
    ;

function setupShaders() {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSrc);
    gl.compileShader(vertexShader);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSrc);
    gl.compileShader(fragmentShader);
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders " + gl.getProgramInfoLog(shaderProgram));
    }
    gl.useProgram(shaderProgram);
    pwgl.vertexPositionAttributeLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(pwgl.vertexPositionAttributeLoc);
    pwgl.vertexTextureAttributeLoc = gl.getAttribLocation(shaderProgram, "aTextureCoordinates");
    gl.enableVertexAttribArray(pwgl.vertexTextureAttributeLoc);
    pwgl.vertexNormalAttributeLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(pwgl.vertexNormalAttributeLoc);
    pwgl.uniformProjMatrixLoc = gl.getUniformLocation(shaderProgram, "uPMatrix");
    pwgl.uniformMVMatrixLoc = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    pwgl.uniformNormalMatrixLoc = gl.getUniformLocation(shaderProgram, "uNMatrix");
    pwgl.uniformSamplerLoc = gl.getUniformLocation(shaderProgram, "uSampler");
    pwgl.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram,
        "uLightPosition");
    pwgl.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram,
        "uAmbientLightColor");
    pwgl.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram,
        "uDiffuseLightColor");
    pwgl.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram,
        "uSpecularLightColor");
    pwgl.uniformSpotDirectionLoc = gl.getUniformLocation(shaderProgram, "uSpotDirection");
    pwgl.modelViewMatrix = mat4.create();
    pwgl.modelViewMatrixStack = [];
    pwgl.projectionMatrix = mat4.create();
}

function setupTextures() {
    // Texture for the Earth
    pwgl.earthTexture = gl.createTexture();
    loadImageForTexture("https://raw.githubusercontent.com/josh-street/webgl-earthsatellite/master/earth.jpg", pwgl.earthTexture);
    // Texture for the satellite
    pwgl.satelliteTexture = gl.createTexture();
    loadImageForTexture("https://raw.githubusercontent.com/josh-street/webgl-earthsatellite/master/satellite.png", pwgl.satelliteTexture);
}
function loadImageForTexture(url, texture) {
    var image = new Image();
    image.crossOrigin = '';
    image.onload = function () {
        pwgl.ongoingImageLoads.splice(pwgl.ongoingImageLoads.indexOf(image), 1);
        textureFinishedLoading(image, texture);
    }
    pwgl.ongoingImageLoads.push(image);
    image.src = url;
}

function textureFinishedLoading(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
        image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function setupLights() {
    gl.uniform3fv(pwgl.uniformLightPositionLoc, [0.0, 500.0, -16.0]);
    gl.uniform3fv(pwgl.uniformSpotDirectionLoc, [0.0, -1.0, 0.0]);
    gl.uniform3fv(pwgl.uniformAmbientLightColorLoc, [0.2, 0.2, 0.2]);
    gl.uniform3fv(pwgl.uniformDiffuseLightColorLoc, [0.7, 0.7, 0.7]);
    gl.uniform3fv(pwgl.uniformSpecularLightColorLoc, [0.8, 0.8, 0.8]);
}

function pushModelViewMatrix() {
    var copyToPush = mat4.create(pwgl.modelViewMatrix);
    pwgl.modelViewMatrixStack.push(copyToPush);
}

function popModelViewMatrix() {
    if (pwgl.modelViewMatrixStack.length == 0) {
        throw "Error popModelViewMatrix() - Stack was empty ";
    }
    pwgl.modelViewMatrix = pwgl.modelViewMatrixStack.pop();
}

function uploadNormalMatrixToShader() {
    var normalMatrix = mat3.create();
    mat4.toInverseMat3(pwgl.modelViewMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(pwgl.uniformNormalMatrixLoc, false, normalMatrix);
}

function uploadModelViewMatrixToShader() {
    gl.uniformMatrix4fv(pwgl.uniformMVMatrixLoc, false,
        pwgl.modelViewMatrix);
}

function uploadProjectionMatrixToShader() {
    gl.uniformMatrix4fv(pwgl.uniformProjMatrixLoc, false,
        pwgl.projectionMatrix);
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

var mouseDown = false;
var earthRotationMatrix = mat4.create();
mat4.identity(earthRotationMatrix);
var earthVertexPositionBuffer;
var earthVertexNormalBuffer;
var earthVertexTextureCoordBuffer;
var earthVertexIndexBuffer;

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

function setupEarthBuffers() {
    var latitudeBands = 60;
    var longitudeBands = 60;
    var radius = 5;
    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);
            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
        }
    }
    var indexData = [];
    for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);
            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }
    earthVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    earthVertexNormalBuffer.itemSize = 3;
    earthVertexNormalBuffer.numItems = normalData.length / 3;
    earthVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    earthVertexTextureCoordBuffer.itemSize = 2;
    earthVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;
    earthVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    earthVertexPositionBuffer.itemSize = 3;
    earthVertexPositionBuffer.numItems = vertexPositionData.length / 3;
    earthVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, earthVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    earthVertexIndexBuffer.itemSize = 1;
    earthVertexIndexBuffer.numItems = indexData.length; // the number of points to draw the Earth, from above calculations with latitude and longitude
}

function setupSatelliteBuffers() {
    pwgl.satelliteVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.satelliteVertexPositionBuffer);
    var satelliteVertexPosition = [
        // Front face
        1.0, 1.0, 1.0, //v0
        -1.0, 1.0, 1.0, //v1
        -1.0, -1.0, 1.0, //v2
        1.0, -1.0, 1.0, //v3

        // Back face
        1.0, 1.0, -1.0, //v4
        -1.0, 1.0, -1.0, //v5
        -1.0, -1.0, -1.0, //v6
        1.0, -1.0, -1.0, //v7

        // Left face
        -1.0, 1.0, 1.0, //v8
        -1.0, 1.0, -1.0, //v9
        -1.0, -1.0, -1.0, //v10
        -1.0, -1.0, 1.0, //v11

        // Right face
        1.0, 1.0, 1.0, //12
        1.0, -1.0, 1.0, //13
        1.0, -1.0, -1.0, //14
        1.0, 1.0, -1.0, //15

        // Top face
        1.0, 1.0, 1.0, //v16
        1.0, 1.0, -1.0, //v17
        -1.0, 1.0, -1.0, //v18
        -1.0, 1.0, 1.0, //v19

        // Bottom face
        1.0, -1.0, 1.0, //v20
        1.0, -1.0, -1.0, //v21
        -1.0, -1.0, -1.0, //v22
        -1.0, -1.0, 1.0, //v23
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(satelliteVertexPosition),
        gl.STATIC_DRAW);
    pwgl.CUBE_VERTEX_POS_BUF_ITEM_SIZE = 3;
    pwgl.CUBE_VERTEX_POS_BUF_NUM_ITEMS = 24;

    // Setup buffer with index
    pwgl.satelliteVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.satelliteVertexIndexBuffer);

    var cubeVertexIndices = [
        0, 1, 2, 0, 2, 3,    // Front face
        4, 6, 5, 4, 7, 6,    // Back face
        8, 9, 10, 8, 10, 11,  // Left face
        12, 13, 14, 12, 14, 15, // Right face
        16, 17, 18, 16, 18, 19, // Top face
        20, 22, 21, 20, 23, 22  // Bottom face
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new
        Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    pwgl.CUBE_VERTEX_INDEX_BUF_ITEM_SIZE = 1;
    pwgl.SATELLITE_VERTEX_INDEX_BUF_NUM_ITEMS = 36;

    // Setup buffer with texture coordinates
    pwgl.satelliteVertexTextureCoordinateBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.satelliteVertexTextureCoordinateBuffer);
    var textureCoordinates = [
        //Front face
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0,

        // Back face
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0,

        // Left face
        1.0, 1.0,
        1.0, 1.0,
        1.0, 1.0,
        1.0, 1.0,

        // Right face
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0,

        // Top face
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0,

        // Bottom face
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0,
        0.0, 0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new
        Float32Array(textureCoordinates), gl.STATIC_DRAW);
    pwgl.CUBE_VERTEX_TEX_COORD_BUF_ITEM_SIZE = 2;
    pwgl.CUBE_VERTEX_TEX_COORD_BUF_NUM_ITEMS = 24;

    // Specify normals to be able to do lighting calculations
    pwgl.satelliteVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.satelliteVertexNormalBuffer);
    var satelliteVertexNormals = [
        // Front face
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back face
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Left face
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,

        // Right face
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Top face
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom face
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(satelliteVertexNormals),
        gl.STATIC_DRAW);
    pwgl.CUBE_VERTEX_NORMAL_BUF_ITEM_SIZE = 3;
    pwgl.CUBE_VERTEX_NORMAL_BUF_NUM_ITEMS = 24;
}


function setupBuffers() {
    setupEarthBuffers();
    setupSatelliteBuffers();
    setupOrbitBuffers();
}


function drawSatellite(texture) {
    // Bind position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.satelliteVertexPositionBuffer);
    gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc,
        pwgl.CUBE_VERTEX_POS_BUF_ITEM_SIZE,
        gl.FLOAT, false, 0, 0);

    // Bind normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.satelliteVertexNormalBuffer);
    gl.vertexAttribPointer(pwgl.vertexNormalAttributeLoc,
        pwgl.CUBE_VERTEX_NORMAL_BUF_ITEM_SIZE,
        gl.FLOAT, false, 0, 0);

    // bind texture coordinate buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, pwgl.satelliteVertexTextureCoordinateBuffer);
    gl.vertexAttribPointer(pwgl.vertexTextureAttributeLoc,
        pwgl.CUBE_VERTEX_TEX_COORD_BUF_ITEM_SIZE,
        gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Bind index buffer and draw cube
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pwgl.satelliteVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, pwgl.SATELLITE_VERTEX_INDEX_BUF_NUM_ITEMS,
        gl.UNSIGNED_SHORT, 0);
}

function drawEarth(texture) {
    // bindBuffer binds array to be used by GPU
    // vertexAttribPointer tells Webgl how to interpret data
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexPositionBuffer);
    gl.vertexAttribPointer(pwgl.vertexPositionAttributeLoc, earthVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexNormalBuffer);
    gl.vertexAttribPointer(pwgl.vertexNormalAttributeLoc, earthVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, earthVertexTextureCoordBuffer);
    gl.vertexAttribPointer(pwgl.vertexTextureAttributeLoc, earthVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, earthVertexIndexBuffer);
    gl.drawElements(gl.TRIANGLES, earthVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
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
    pwgl.requestId = requestAnimFrame(draw);
    var currentTime = Date.now();
    handlePressedDownKeys();

    mat4.translate(pwgl.modelViewMatrix, [0.0, transY, transZ],
        pwgl.modelViewMatrix);
    mat4.rotateX(pwgl.modelViewMatrix, xRot / 50, pwgl.modelViewMatrix);
    mat4.rotateY(pwgl.modelViewMatrix, yRot / 50, pwgl.modelViewMatrix);

    yRot = xRot = zRot = transY = transZ = 0;

    gl.uniform1i(pwgl.uniformSamplerLoc, 0);
    pushModelViewMatrix();
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        newAngle += (90 * elapsed) / 1000;
    }
    lastTime = timeNow;
    var rotationSpeed = -degToRad(newAngle) / 50; // Sets earth rotation speed 
    mat4.rotateY(pwgl.modelViewMatrix, rotationSpeed, pwgl.modelViewMatrix);
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    drawEarth(pwgl.earthTexture);
    popModelViewMatrix();
    pushModelViewMatrix();
    if (currentTime === undefined) {
        currentTime = Date.now();
    }

    if (pwgl.animationStartTime === undefined) {
        pwgl.animationStartTime = currentTime;
    }

    pwgl.angle = (currentTime - pwgl.animationStartTime) / pwgl.orbitalMultipler * 2 * Math.PI % (2 * Math.PI); // determines where in the orbit the satellite should be at a given time
    pwgl.x = Math.cos(pwgl.angle) * pwgl.circleRadius;
    pwgl.z = Math.sin(pwgl.angle) * pwgl.circleRadius;


    mat4.translate(pwgl.modelViewMatrix, [pwgl.x, pwgl.y, pwgl.z],
        pwgl.modelViewMatrix); 
        // translates the vector x,y,z by modelViewMatrix and stores the update in modelViewMatrix
        // moves the satellite around the orbit
    mat4.scale(pwgl.modelViewMatrix, [0.5, 0.5, 0.5], pwgl.modelViewMatrix);
        // determines the size of the satellite image
        // scales the vector 0.5,0.5,0.5 by modelViewMatrix and stores the update in modelViewMatrix

    // CRUDE NOT WORKING FULLY 
    pwgl.satRotation = -degToRad(newAngle) * pwgl.satMultiplier;
    mat4.rotateY(pwgl.modelViewMatrix, pwgl.satRotation, pwgl.modelViewMatrix);
    uploadModelViewMatrixToShader();
    // uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
    drawSatellite(pwgl.satelliteTexture);
    popModelViewMatrix();

    const offset = 0;
    const vertexCount = 4;
    drawOrbit();
}

function startup() {
    var canvas = document.getElementById("myCanvas");
    canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
    canvas.addEventListener('webglcontextlost', handleContextLost, false);
    canvas.addEventListener('webglcontextrestored', handleContextRestored,
        false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener('keyup', handleKeyUp, false);
    canvas.addEventListener('mousemove', mymousemove, false);
    canvas.addEventListener('mousedown', mymousedown, false);
    canvas.addEventListener('mouseup', mymouseup, false);
    canvas.addEventListener('mousewheel', wheelHandler, false);
    canvas.addEventListener('DOMMouseScroll', wheelHandler, false);
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
    setupLights();
    setupTextures();
    // Transparent canvas for space background image
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.DEPTH_TEST);
    pwgl.x = 0.0;
    pwgl.y = 0.0;
    pwgl.z = 0.0;
    pwgl.circleRadius = 10.0; // radius of satellite around Earth
    pwgl.orbitalMultipler = 2000;
    pwgl.satMultiplier = 1; // spin of satellite


    // Initialize some variables related to the animation
    pwgl.animationStartTime = undefined;
    pwgl.previousFrameTimeStamp = Date.now();
    mat4.perspective(30, gl.viewportWidth / gl.viewportHeight, 1, 100.0, pwgl.projectionMatrix);
    mat4.identity(pwgl.modelViewMatrix);
    mat4.lookAt([0, 0, 50], [0, 0, 0], [0, 1, 0], pwgl.modelViewMatrix);
}

function handleContextLost(event) {
    event.preventDefault();
    cancelRequestAnimFrame(pwgl.requestId);
    // Ignore all ongoing image loads by removing their onload handler
    for (var i = 0; i < pwgl.ongoingImageLoads.length; i++) {
        pwgl.ongoingImageLoads[i].onload = undefined;
    }
    pwgl.ongoingImageLoads = [];
}

function handleContextRestored(event) {
    init();
    pwgl.requestId = requestAnimFrame(draw, canvas);
}

function handleKeyDown(event) {
    pwgl.listOfPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    pwgl.listOfPressedKeys[event.keyCode] = false;
}

function handlePressedDownKeys() {
    if (pwgl.listOfPressedKeys[38]) {
        // Arrow up, increase radius of circle
        if (pwgl.circleRadius < 50) {
            pwgl.circleRadius += 0.1;
        } else {
            pwgl.circleRadius = 20;
        }
    }
    if (pwgl.listOfPressedKeys[40]) {
        // Arrow down, decrease radius of circle
        pwgl.circleRadius -= 0.1;
        if (pwgl.circleRadius > 6) {
            pwgl.circleRadius -= 0.1
        } else {
            pwgl.circleRadius = 6;
        }

    }
    if (pwgl.listOfPressedKeys[37]) {
        // Left Arrow, speed up orbital speed
        pwgl.orbitalMultipler -= 20;
        var x = pwgl.orbitalMultipler * relation;
        var y = 1.6 - x;
        pwgl.satMultiplier = 1.6 + y;
        if (pwgl.orbitalMultipler < 250) {
            pwgl.orbitalMultipler = 250
        }
    }
    if (pwgl.listOfPressedKeys[39]) {
        // Right Arrow, slow down orbital speed
        pwgl.orbitalMultipler += 50;
        var x = pwgl.orbitalMultipler * relation;
        var y = 1.6 - x;
        pwgl.satMultiplier = 1.6 + y;
        console.log(pwgl.satMultiplier);
        if (pwgl.orbitalMultipler > 20000) {
            pwgl.orbitalMultipler = 20000;
        }
    }
}

function mymousedown(ev) {
    drag = 1;
    xOffs = ev.clientX;
    yOffs = ev.clientY;
}

function mymouseup(ev) {
    drag = 0;
}

function mymousemove(ev) {
    if (drag == 0) return;
    if (ev.shiftKey) {
        transZ = (ev.clientY - yOffs) / 10;
    }
    else if (ev.altKey) {
        transY = -(ev.clientY - yOffs) / 10;
    }
    else {
        yRot = - xOffs + ev.clientX;
        xRot = - yOffs + ev.clientY;
    }
    xOffs = ev.clientX;
    yOffs = ev.clientY;
}

function wheelHandler(ev) {
    if (ev.altKey) transY = -ev.detail / 10;
    else transZ = ev.detail / 10;
    ev.preventDefault();
}