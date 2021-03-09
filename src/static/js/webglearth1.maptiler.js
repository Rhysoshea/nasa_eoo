const gl = document.getElementById("myCanvas").getContext("webgl");

let aspectRatio;
let currentRotation = [0, 1];
let currentScale = [1.0, 1.0];

// Vertex information

let vertexArray;
let vertexBuffer;
let vertexNumComponents;
let vertexCount;

// Rendering data shared with the
// scalers.

let uScalingFactor;
let uGlobalColor;
let uRotationVector;
let aVertexPosition;

// Animation timing

let previousTime = 0.0;
let degreesPerSecond = 10.0;


// const vertexShader = `
//     attribute vec2 aVertexPosition;

//     uniform vec2 uScalingFactor;
//     uniform vec2 uRotationVector;

//     void main() {
//         vec2 rotatedPosition = vec2(
//             aVertexPosition.x * uRotationVector.y +
//                 aVertexPosition.y * uRotationVector.x,
//             aVertexPosition.y * uRotationVector.y - 
//                 aVertexPosition.x * uRotationVector.x
//         );
//         gl_Position = vec4(rotatedPosition * uScalingFactor, 0.0, 1.0);
//     }
// `

const vertexShader = `
    attribute vec2 aVertexPosition;

    uniform vec2 uScalingFactor;
    uniform vec2 uRotationVector;

    void main() {
        
        gl_Position = vec4(aVertexPosition * uRotationVector * uScalingFactor, 0.0, 1.0);

    }
`

const fragmentShader = `
    precision highp float;

  uniform vec4 uGlobalColor;

  void main() {
    gl_FragColor = uGlobalColor;
  }
    `;





function animateScene() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0.8, 0.9, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let radians = currentAngle * Math.PI / 180.0;
    currentRotation[0] = Math.sin(radians);
    currentRotation[1] = Math.cos(radians);

    gl.useProgram(shaderProgram);

    uScalingFactor =
        gl.getUniformLocation(shaderProgram, "uScalingFactor");
    uGlobalColor =
        gl.getUniformLocation(shaderProgram, "uGlobalColor");
    uRotationVector =
        gl.getUniformLocation(shaderProgram, "uRotationVector");

    gl.uniform2fv(uScalingFactor, currentScale);
    gl.uniform2fv(uRotationVector, currentRotation);
    gl.uniform4fv(uGlobalColor, [0.1, 0.7, 0.2, 0.5]);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    aVertexPosition =
        gl.getAttribLocation(shaderProgram, "aVertexPosition");

    gl.enableVertexAttribArray(aVertexPosition);
    gl.vertexAttribPointer(aVertexPosition, vertexNumComponents,
        gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);

    window.requestAnimationFrame(function (currentTime) {
        let deltaAngle = ((currentTime - previousTime) / 1000.0)
            * degreesPerSecond;

        currentAngle = (currentAngle + deltaAngle) % 360;

        previousTime = currentTime;
        animateScene();
    });
}

function buildShaderProgram(shaderInfo) {
    let program = gl.createProgram();

    shaderInfo.forEach(function (desc) {
        let shader = compileShader(desc.id, desc.type);

        if (shader) {
            gl.attachShader(program, shader);
        }
    });

    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Error linking shader program:");
        console.log(gl.getProgramInfoLog(program));
    }

    return program;
}

function compileShader(id, type) {
    let code = id;
    let shader = gl.createShader(type);

    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
        console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
}

function createCircle(radius, size) {
    const numSlices = 360.0;
    const vertexPerTriangle = 3.0;
    const numVerts = numSlices * vertexPerTriangle;
    // let radius = 0.5;

    const arr = new Float32Array(numVerts+1);
    for (i=0; i<numVerts+1; i=i+2) {
        let sliceId = Math.floor(i/vertexPerTriangle);
        let triVertexId = i % vertexPerTriangle;
        let edge = triVertexId + sliceId;
        let u = edge / numSlices;
        let angle = u * Math.PI *2.0;
        arr[i ] = ((Math.cos(angle)*size) + radius);
        arr[i + 1] = ((Math.sin(angle)*size) + radius);
    };

    return arr;
}

function createSatellites() {
    // let circleId =  Math.floor(vertexId / numVertsPerCircle);
    let numCircles = 1;

    // let u = circleId / numCircles; // goes from 0 to 1
    // float angle = u * PI * 2.0; // goes from 0 to 2PI
    // float angle = 0.0;
    let orbitRadius = 0.5;
    let satRadius = 0.05;

    // vec2 pos = vec2(cos(angle), sin(angle)) * orbitRadius;
    // vec2 triPos = computeCircleTriangleVertex(vertexId) * satRadius;

    // gl_Position = vec4((pos + triPos)*scale, 0, 1);

    return createCircle(orbitRadius, satRadius);
}


function startup() {


    const shaderSet = [
        {
            type: gl.VERTEX_SHADER,
            id: vertexShader
        },
        {
            type: gl.FRAGMENT_SHADER,
            id: fragmentShader
        }

    ];

    shaderProgram = buildShaderProgram(shaderSet);

    aspectRatio = gl.canvas.width / gl.canvas.height;
    currentRotation = [0, 1];
    currentScale = [1.0, aspectRatio];

    // vertexArray = createCircle(0);
    vertexArray = createSatellites();
    console.log(vertexArray);
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    vertexNumComponents = 2;
    vertexCount = vertexArray.length / vertexNumComponents;
    console.log(vertexCount);
    currentAngle = 0.0;
    rotationRate = 6;

    animateScene();

}

