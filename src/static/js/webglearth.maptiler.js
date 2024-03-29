const gl = document.getElementById("myCanvas").getContext("webgl2");

var vs = `#version 300 es

in vec4 a_position;
in vec4 a_color;

uniform mat4 u_matrix;

out vec4 v_color;

void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;

  // Pass the color to the fragment shader.
  v_color = a_color;
}
`;

var fs = `#version 300 es
precision highp float;

// Passed in from the vertex shader.
in vec4 v_color;

uniform vec4 u_colorMult;
uniform vec4 u_colorOffset;

out vec4 outColor;

void main() {
   outColor = v_color * u_colorMult + u_colorOffset;
}
`;

var Node = function (source) {
    this.children = [];
    this.localMatrix = m4.identity();
    this.worldMatrix = m4.identity();
    this.source = source;
};

Node.prototype.setParent = function (parent) {
    // remove us from our parent
    if (this.parent) {
        var ndx = this.parent.children.indexOf(this);
        if (ndx >= 0) {
            this.parent.children.splice(ndx, 1);
        }
    }

    // Add us to our new parent
    if (parent) {
        parent.children.push(this);
    }
    this.parent = parent;
};

Node.prototype.updateWorldMatrix = function (matrix) {

    var source = this.source;
    if(source) {
        source.getMatrix(this.localMatrix);
    }

    if (matrix) {
        // a matrix was passed in so do the math
        m4.multiply(matrix, this.localMatrix, this.worldMatrix);
    } else {
        // no matrix was passed in so just copy.
        m4.copy(this.localMatrix, this.worldMatrix);
    }

    // now process all the children
    var worldMatrix = this.worldMatrix;
    this.children.forEach(function (child) {
        child.updateWorldMatrix(worldMatrix);
    });
};


// TRS and adding a source used for fixing error collected with each frame
var TRS = function () {
    this.translation = [0, 0, 0];
    this.rotation = [0, 0, 0];
    this.scale = [1, 1, 1];
};

TRS.prototype.getMatrix = function (dst) {
    dst = dst || new Float32Array(16);
    var t = this.translation;
    var r = this.rotation;
    var s = this.scale;

    // compute a matrix from translation, rotation, and scale
    m4.translation(t[0], t[1], t[2], dst);
    m4.xRotate(dst, r[0], dst);
    m4.yRotate(dst, r[1], dst);
    m4.zRotate(dst, r[2], dst);
    m4.scale(dst, s[0], s[1], s[2], dst);
    return dst;
};


// function setupTextures() {
//     // Texture for the Earth
//     pwgl.earthTexture = gl.createTexture();
//     loadImageForTexture("https://raw.githubusercontent.com/josh-street/webgl-earthsatellite/master/earth.jpg", pwgl.earthTexture);
//     // Texture for the satellite
//     pwgl.satelliteTexture = gl.createTexture();
//     loadImageForTexture("https://raw.githubusercontent.com/josh-street/webgl-earthsatellite/master/satellite.png", pwgl.satelliteTexture);
// }
// function loadImageForTexture(url, texture) {
//     var image = new Image();
//     image.crossOrigin = '';
//     image.onload = function () {
//         pwgl.ongoingImageLoads.splice(pwgl.ongoingImageLoads.indexOf(image), 1);
//         textureFinishedLoading(image, texture);
//     }
//     pwgl.ongoingImageLoads.push(image);
//     image.src = url;
// }

// function textureFinishedLoading(image, texture) {
//     gl.bindTexture(gl.TEXTURE_2D, texture);
//     gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
//     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
//         image);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//     gl.generateMipmap(gl.TEXTURE_2D);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
//     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
//     gl.bindTexture(gl.TEXTURE_2D, null);
// }


function startup() {


    // Tell the twgl to match position with a_position, n
    // normal with a_normal etc..
    twgl.setAttributePrefix("a_");

    var sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);

    // setup GLSL program
    var programInfo = twgl.createProgramInfo(gl, [vs, fs]);

    var sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);

    function degToRad(d) {
        return d * Math.PI / 180;
    }

    var fieldOfViewRadians = degToRad(60);

    var objectsToDraw = [];
    var objects = [];

    var someTRS = new TRS();
    var someNode = new Node(someTRS);

    // Let's make all the nodes
    var solarSystemNode = new Node();
    var earthOrbitNode = new Node();
    // earth orbit 100 units from the sun
    // earthOrbitNode.localMatrix = m4.translation(100, 0, 0);

    var satelliteOrbitNode = new Node();
    // satellite 20 units from the earth
    satelliteOrbitNode.localMatrix = m4.translation(10, 0, 0);

    // var sunNode = new Node();
    // sunNode.localMatrix = m4.scaling(5, 5, 5); // make the sun 5 times as large
    // sunNode.drawInfo = {
    //     uniforms: {
    //         u_colorOffset: [0.6, 0.6, 0, 1], // yellow
    //         u_colorMult: [0.4, 0.4, 0, 1],
    //     },
    //     programInfo: programInfo,
    //     bufferInfo: sphereBufferInfo,
    //     vertexArray: sphereVAO,
    // };

    var earthNode = new Node();

    earthNode.localMatrix = m4.scaling(5, 5, 5);   // make the earth 5x as large
    earthNode.drawInfo = {
        uniforms: {
            u_colorOffset: [0.2, 0.5, 0.8, 1],  // blue-green
            u_colorMult: [0.8, 0.5, 0.2, 1],
        },
        programInfo: programInfo,
        bufferInfo: sphereBufferInfo,
        vertexArray: sphereVAO,
    };

    var satelliteNode = new Node();
    satelliteNode.localMatrix = m4.scaling(0.4,0.4,0.4);
    satelliteNode.drawInfo = {
        uniforms: {
            u_colorOffset: [0.6, 0.6, 0.6, 1],  // gray
            u_colorMult: [0.1, 0.1, 0.1, 1],
        },
        programInfo: programInfo,
        bufferInfo: sphereBufferInfo,
        vertexArray: sphereVAO,
    };

    // connect the celestial objects
    // sunNode.setParent(solarSystemNode);
    // earthOrbitNode.setParent(solarSystemNode);
    earthNode.setParent(solarSystemNode);
    satelliteOrbitNode.setParent(earthNode);
    satelliteNode.setParent(satelliteOrbitNode);

    var objects = [
        earthNode,
        satelliteNode,
    ];

    var objectsToDraw = [
        earthNode.drawInfo,
        satelliteNode.drawInfo,
    ];

    requestAnimationFrame(drawScene);
    // Draw the scene.
    function drawScene(time) {
        time *= 0.001;

        twgl.resizeCanvasToDisplaySize(gl.canvas);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Compute the projection matrix
        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var projectionMatrix =
            m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        // Compute the camera's matrix using look at.
        var cameraPosition = [0, -200, 0];
        var target = [0, 0, 0];
        var up = [0, 0, 1];
        var cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        var viewMatrix = m4.inverse(cameraMatrix);

        var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

        // update the local matrices for each object.
        // m4.multiply(m4.yRotation(0.01), earthOrbitNode.localMatrix, earthOrbitNode.localMatrix);
        m4.multiply(m4.yRotation(0.01), satelliteOrbitNode.localMatrix, satelliteOrbitNode.localMatrix);

        // // spin the sun
        // m4.multiply(m4.yRotation(0.005), sunNode.localMatrix, sunNode.localMatrix);
        // spin the earth
        m4.multiply(m4.yRotation(0.005), earthNode.localMatrix, earthNode.localMatrix);
        // spin the satellite
        m4.multiply(m4.yRotation(-0.01), satelliteNode.localMatrix, satelliteNode.localMatrix);

        // Update all world matrices in the scene graph
        solarSystemNode.updateWorldMatrix();

        someTRS.rotation[2] += time;


        // Compute all the matrices for rendering
        objects.forEach(function (object) {
            object.drawInfo.uniforms.u_matrix = m4.multiply(viewProjectionMatrix, object.worldMatrix);
        });

        // ------ Draw the objects --------

        twgl.drawObjectList(gl, objectsToDraw);

        requestAnimationFrame(drawScene);
    }
}