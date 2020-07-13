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
        var canvas = document.getElementById('myCanvas');
        var context = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;
        var centerX = canvas.width / 2;
        var centerY = canvas.height / 2;
        var radius = 70;
        var deg = 1; // degrees to rotate each frame by
        var radians = (Math.PI / 180)*deg; // degree conversion to radians
        // var Planet_Position = {X: centerX, Y: centerY};
        // var Satellite_Position = {X: centerX +100, Y: centerY};

        var circle = function(color, r) {
            context.lineColor = color;
            context.lineWidth = 10;
            context.beginPath();
            context.arc(centerX, centerY, r, 0, 2*Math.PI, false);
            context.closePath();
            context.stroke();
            // context.fill();
        }
   
        var i = 0;

        circle("red", radius);
        context.translate(centerX, centerY-10); //set origin to centre

        var redraw = function() {
            context.save(); //saves the current state to the stack

            // context.translate(centerX+40, centerY); //set origin to centre

            context.rotate(i/radians); //rotates canvas by (x) radians
            context.translate(1,0); //moves canvas (0,0) point by (x,y) amount
            circle("green", 10);

            context.restore(); //restores the top of the stack, after we've drawn some shapes
            i++;
            window.requestAnimationFrame(redraw);
        }
        window.requestAnimationFrame(redraw);


        return (
            <div>      
                {/* <canvas id="myCanvas" width="800" height="600"></canvas> */}
            </div>
        );
    }
}

// function OrbitDisplay (sat_num){

//     var canvas = document.getElementById('myCanvas');
//     var context = canvas.getContext('2d');
//     // var centerX = canvas.width / 2;
//     // var centerY = canvas.height / 2;
//     // var radius = 70;

//     // context.beginPath();
//     // context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
//     // context.fillStyle = 'green';
//     // context.fill();
//     // context.lineWidth = 500;
//     // context.strokeStyle = '#003300';
//     // context.stroke();
//     context.font = "60px Arial";
//     context.strokeText(sat_num, 10, 50);

//     return (
//       <canvas id="myCanvas" width="800" height="600"></canvas>
//     )
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
