const gl = document.getElementById("myCanvas").getContext("webgl");
// canvas = WebGLDebugUtils.makeLostContextSimulatingCanvas(canvas);
var currentAngle = 0.0;
let currentRotation = [0, 1];


// const vertexShader = `
//     attribute float vertexId;
//     uniform float numVerts;
//     uniform vec2 resolution;
//     uniform float time;

//     #define PI radians(180.0)

//     const float numSlices = 360.0;
//     const float numVertsPerCircle = numSlices * 3.0;

//     vec2 computeCircleTriangleVertex (float vertexId) {
//         float sliceId = floor(vertexId / 3.0);
//         float triVertexId = mod(vertexId, 3.0);
//         float edge = triVertexId + sliceId;
//         float angleU = edge / numSlices;
//         float angle = angleU * PI * 2.0;
//         float radius = step(triVertexId, 1.5);
//         return vec2(cos(angle), sin(angle)) * radius;
//     }


//     void createSatellites() {
//         float circleId = floor(vertexId / numVertsPerCircle);
//         float numCircles = numVerts / numVertsPerCircle;

//         float u = circleId / numCircles; // goes from 0 to 1
//         // float angle = u * PI * 2.0; // goes from 0 to 2PI
//         float angle = 0.0;
//         float orbitRadius = 0.72;
//         float satRadius = 0.05;

//         vec2 pos = vec2(cos(angle), sin(angle)) * orbitRadius;
//         vec2 triPos = computeCircleTriangleVertex(vertexId) * satRadius;

//         float aspect = resolution.y / resolution.x; 
//         vec2 scale = vec2(aspect, 1);
//         gl_Position = vec4((pos + triPos)*scale, 0, 1);
//     }

//     void main () {
//         createSatellites();
//     }
//     `;

const vertexShader = `
    attribute vec2 aVertexPosition;

    uniform vec2 uScalingFactor;
    uniform vec2 uRotationVector;

    void main() {
        vec2 rotatedPosition = vec2(
            aVertexPosition.x * uRotationVector.y +
                aVertexPosition.y * uRotationVector.x,
            aVertexPosition.y * uRotationVectory.y - 
                aVertexPosition.x * uRotationVector.x
        );
        gl_Position = vec4(rotatedPosition * uScalingFactor, 0.0, 1.0);
    };
`

const vertexShader2 = `
    attribute float vertexId;
    uniform vec2 resolution;
    uniform float time;
    uniform mat4 u_matrix;

    #define PI radians(180.0)

    const float numVerts = 360.0;

    vec2 computeCircleTriangleVertex (float vertexId) {
        float u = vertexId / numVerts;
        float angle = u * PI * 2.0;
        float radius = 0.8;
        return vec2(cos(angle), sin(angle)) * radius;
    }

    void createOrbit() {
        float orbitRadius = 0.9;

        vec2 pos = computeCircleTriangleVertex(vertexId) * orbitRadius;

        float aspect = resolution.y / resolution.x; 
        vec2 scale = vec2(aspect, 1);
        gl_Position = vec4(pos*scale, 0, 1);
    }

    void main () {
        createOrbit();
    }
    `;

const fragmentShader = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1,0,0,1);
    }
    `;

const fragmentShader2 = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(0,0,1,1);
    }
    `;
// setup GLSL program

function setupGLSLProgram(vs, fs, numCircles){
    const program = webglUtils.createProgramFromSources(gl, [vs, fs]);
    var vertexIdLoc = gl.getAttribLocation(program, 'vertexId');
    var numVertsLoc = gl.getUniformLocation(program, 'numVerts');
    var resolutionLoc = gl.getUniformLocation(program, 'resolution');
    var timeLoc = gl.getUniformLocation(program, 'time');
    var matrixLocation = gl.getUniformLocation(program, 'u_matrix');


    numVerts = 360 * 3 * numCircles; // 1 circle, 360 points per circle, 3 points per triangle
    const vertexIds = new Float32Array(numVerts);
    vertexIds.forEach((v, i) => {
        vertexIds[i] = i;
    });

    const idBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, idBuffer);
    var matrixLocation = gl.getUniformLocation(program, 'vertexId');

    gl.bufferData(gl.ARRAY_BUFFER, vertexIds, gl.STATIC_DRAW);

    return [program,vertexIdLoc,numVertsLoc,resolutionLoc,numVerts,idBuffer,matrixLocation];
}

// draw
function draw(program, vertexIdLoc, numVertsLoc, resolutionLoc, numVerts, idBuffer, primitiveType, deltaTime) {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clearDepth(1.0);                 // Clear everything
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    // {
    // Turn on the attribute
    gl.enableVertexAttribArray(vertexIdLoc);

    // Bind the id buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, idBuffer);

    // Tell the attribute how to get data out of idBuffer (ARRAY_BUFFER)
    const size = 1;          // 1 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        vertexIdLoc, size, type, normalize, stride, offset);
    // }

    // tell the shader the number of verts
    gl.uniform1f(numVertsLoc, numVerts);
    // // tell the shader the resolution
    gl.uniform2f(resolutionLoc, gl.canvas.width, gl.canvas.height);
    // tell the shader the time
    // gl.uniform1f(timeLoc, time);

    gl.drawArrays(primitiveType, offset, numVerts);

    orbitRotation += deltaTime;

}

var then = 0;

function render(time) {
    
    time *= 0.001; // convert to seconds
    const deltaTime = time - then;
    then = time;
    const [program1, vertexIdLoc1, numVertsLoc1, resolutionLoc1, numVerts1, idBuffer1, matrixLoc1] = setupGLSLProgram(vertexShader, fragmentShader, 1);
    // const [program2, vertexIdLoc2, numVertsLoc2, resolutionLoc2, numVerts2, idBuffer2, matrixLoc2] = setupGLSLProgram(vertexShader2, fragmentShader2, 1);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    draw(program1, vertexIdLoc1, numVertsLoc1, resolutionLoc1, numVerts1, idBuffer1, gl.TRIANGLES, deltaTime);

    var matrixLocation = gl.getUniformLocation(program1, 'numVerts');
    var angleInRadians = 1;
    var rotationMatrix = m3.rotation(angleInRadians);
    // console.log(matrixLoc2);
    // console.log(rotationMatrix);

    const modelViewMatrix = mat4.create();

    mat4.rotate(modelViewMatrix,
                modelViewMatrix,
                orbitRotation,
                [0,0,1]);

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLoc2, false, modelViewMatrix);
    console.log(modelViewMatrix);

    draw(program2, vertexIdLoc2, numVertsLoc2, resolutionLoc2, numVerts2, idBuffer2, gl.LINES, deltaTime);

    requestAnimationFrame(render);
}

var m3 = {
    translation: function (tx, ty) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
        ];
    },

    rotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    }
};

function startup() {
    requestAnimationFrame(render);
}

