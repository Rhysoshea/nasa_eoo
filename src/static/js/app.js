// function App() {
//     const { Container, Row, Col } = ReactBootstrap;
//     return (
//         <Container>
//             <Row>
//                 <Col md={{ offset: 3, span: 6 }}>
//                     <DropdownList />
//                 </Col>
//             </Row>
//         </Container>
//     );
// }

// function DropdownList() {
//     const [items, setItems] = React.useState(null);

//     React.useEffect(() => {
//         fetch('/items')
//             .then(r => r.json())
//             .then(setItems);
//     }, []);

//     const onItemUpdate = React.useCallback(
//         item => {
//             const index = items.findIndex(i => i.id === item.id);
//             setItems([
//                 ...items.slice(0, index),
//                 item,
//                 ...items.slice(index + 1),
//             ]);
//         },
//         [items],
//     );

//     if (items === null) return 'Loading...';

//     return (
//         <React.Fragment>
//             {/* <AddItemForm onNewItem={onNewItem} /> */}
//             {items.length === 0 && (
//                 <p className="text-center">No satellites in database</p>
//             )}
//             {items.map(item => (
//                 <ItemDisplay
//                     item={item}
//                     key={item.id}
//                 />
//             ))}
//         </React.Fragment>
//     );
// }

// function ItemDisplay({ item }) {
//     const { Container, Row, Col, Button } = ReactBootstrap;


//     // const removeItem = () => {
//     //     fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
//     //         onItemRemoval(item),
//     //     );
//     // };

//     return (
//         // <DropdownButton id="dropdown-basic-button" title="Satellite List">
//         //     <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
//         //     <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
//         //     <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>        
//         // </DropdownButton>
//         <Dropdown>
//             <Dropdown.Toggle variant="success" id="dropdown-basic">
//                 Dropdown Button
//   </Dropdown.Toggle>

//             <Dropdown.Menu>
//                 <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
//                 <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
//                 <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
//             </Dropdown.Menu>
//         </Dropdown>
//     );
// }


class App extends React.Component {
    constructor(props) {
        super(props);
    }
        render () {
            return (
                <DropdownList />
            );
        }
}


function DropdownList() {
    const [items, setItems] = React.useState(null);

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);


    if (items === null) return 'Loading...';
    // console.log(items);

    let optionItems = items.map((item) =>
        <option key={item} selected>{item.name}</option>
    );
    // console.log(optionItems)
    return (
        <ItemDisplay items={optionItems} />
 
    );
}

class ItemDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event){
        // OrbitDisplay(sat_num=this.state.value);
        alert("Searching for satellite: " + this.state.value);
        // event.preventDefault();
    }

    
    render() {

        return (

            <div>
                <div id="instructions">
                    <h1>Instructions:</h1>
                    <p style={{ color: "white" }}>Select a satellite from the dropdown list</p>
                </div>

                <form onSubmit={this.handleSubmit}>
                    <div>
                        <select id="sat_dropdown" value={this.state.value} onChange={this.handleChange}>
                            <option value="hide">-- Satellites --</option>

                            {this.props.items}
                        </select>
                        <input type="submit" value="Show"/>
                    </div>
                </form>

                <OrbitDisplay sat_num={this.state.value}/>

            </div>
        );
    }

}

class OrbitDisplay extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        var gl;
        var pwgl = {};
        pwgl.ongoingImageLoads =[];
        var canvas;

        // variables for interactive control 
        var transY=0, transZ=0;
        var xRot = yRot = zRot = xOffs = yOffs = drag = 0;
        pwgl.listOfPressedKeys = [];
        var lastTime = 0;

        // keep track of pressed down keys in a list 
        function createGLContext(canvas) {
            var names = ["webgl", "experimental-webgl"];
            var context = null;
            for (var i=0; i<names.length; i++) {
                try {
                    context = canvas.getContext(names[i]);
                }
                catch(e) {
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
                alert("Failed to create WebGL context");
            }
            return context;
        }

        // setup textures of objects
        function setupTextures() {
            // texture for the Earth
            pwgl.earthTexture = gl.createTexture();
            loadImageForTexture("https://github.com/Rhysoshea/nasa_eoo/blob/master/images/earth.jpg?raw=true",
            pwgl.earthTexture);

            // texture for the satellite
            pwgl.satelliteTexture = gl.createTexture("https://raw.githubusercontent.com/josh-street/webgl-earthsatellite/master/satellite.png",
            pwgl.satelliteTexture);
        }
        
        function loadImageForTexture(url, texture) {
            var image = new Image();
            image.crossOrigin = '';
            image.onload = function() {
                pwgl.ongoingImageLoads.splice(pwgl.ongoingImageLoads.indexOf(image), 1);
                textureFinishedLoading(image,texture);
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

        function degToRad(degrees) {
            return degrees * Math.PI / 180;
        }


        var mouseDown = false;
        var lastMousex = null;
        var lastMouseY = null;

        var earthRotationMatrix = mat4.create();
        mat4.identity(earthRotationMatrix);
        var earthVertexPositionBuffer;
        var earthVertexNormalBuffer;
        var earthVertexTextureCoordBuffer;
        var earthVertexIndexBuffer;

        function setupEarthBuffers() {
            // splits Earth into 60 lat and long bands, can increase for greater detail
            var latitudeBands = 60; 
            var longitudeBands = 60;
            var radius = 5;
            var vertexPositionData = [];
            var normalData = [];
            var textureCoordData = [];

            for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                var theta = latNumber*Math.PI / latitudeBands;
                var sinTheta = Math.sin(theta);
                var cosTheta = Math.cos(theta);
                for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                    var phi = longNumber*2*Math.PI / longitudeBands;
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
            earthVertexIndexBuffer.numItems = indexData.length;
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

        return (
            <div>      
                {/* <canvas id="myCanvas" width="800" height="600"></canvas> */}
            </div>
        );
    }
}

// class OrbitDisplay extends React.Component {
//     constructor(props) {
//         super(props);
//     }

//     render() {
//         var canvas = document.getElementById('myCanvas');
//         var context = canvas.getContext('2d');
//         var w = canvas.width;
//         var h = canvas.height;
//         var centerX = canvas.width / 2;
//         var centerY = canvas.height / 2;
//         var radius = 70;
//         var deg = 100; // degrees to rotate each frame by
//         var radians = (Math.PI / 180) * deg; // degree conversion to radians
//         // var Planet_Position = {X: centerX, Y: centerY};
//         // var Satellite_Position = {X: centerX +100, Y: centerY};

//         var circle = function (color, r) {
//             context.lineColor = color;
//             context.lineWidth = 10;
//             context.beginPath();
//             context.arc(centerX, centerY, r, 0, 2 * Math.PI, false);
//             context.closePath();
//             context.stroke();
//             // context.fill();
//         }

//         var i = 0;

//         // context.translate(centerX, centerY-10); //set origin to centre

//         var redraw = function () {
//             context.save(); //saves the current state to the stack

//             context.fillStyle = "white";
//             context.fillRect(0, 0, w, h);

//             // context.translate(centerX, centerY); //set origin to centre
//             circle("red", radius);

//             context.rotate(0); //rotates canvas by (x) radians
//             context.translate(200, 0); //moves canvas (0,0) point by (x,y) amount
//             circle("green", 50);

//             context.restore(); //restores the top of the stack, after we've drawn some shapes
//             i++;
//             window.requestAnimationFrame(redraw);
//         }
//         window.requestAnimationFrame(redraw);


//         return (
//             <div>
//                 {/* <canvas id="myCanvas" width="800" height="600"></canvas> */}
//             </div>
//         );
//     }
// }


// function ItemDisplay({ items }) {

//     return (
//         <div>
//             <div id="instructions">
//                 <h1>Instructions:</h1>
//                 <p style={{ color: "white" }}>Select a satellite from the dropdown list</p>
//             </div>

//             <div>
//                 <select id="sat_dropdown">
//                     <option value="hide">-- Satellites --</option>

//                     {items}
//                 </select>
//             </div>
//         </div>
//     );
// }

ReactDOM.render(<App />, document.getElementById('root'));
