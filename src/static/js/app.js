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
    // useInfoDisplay(); //this successfully calls function

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    if (items === null) return 'Loading...';

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
        this.state = {name: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    useInfoDisplay() {
        // const [items, setItems] = React.useState(null);
    
        // React.useEffect(() => {
        //     fetch('/items')
        //         .then(r => r.json())
        //         .then(setItems);
        // }, []);
    
        // const removeItem = () => {
        //     fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
        //         onItemRemoval(item),
        //         );
        //     };
        let itemParameters = [];
        // let itemParameters = items.map((item) =>
        //     <option key={item} selected>{item.name}</option>
        // );
        console.log("hello world");
        console.log(itemParameters);
        return (
            <ParameterDisplay items={itemParameters} />
     
        );
    }

    handleChange(event) {
        this.setState({name: event.target.value});
    }

    handleSubmit(event){
        alert("Searching for satellite: " + this.state.name);
        event.preventDefault(); // prevents page from refreshing

        this.useInfoDisplay(); //this does not successfully call function

        // return (

        //     <InfoDisplay/>
        // )

    }


    
    render() {

        return (

            <div>
                <div id="instructions">
                    <h1>Instructions:</h1>
                    <p style={{ color: "white" }}>Select a satellite from the dropdown list</p>
                </div>

                <div id="sat_list_div">
                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <select id="sat_dropdown" value={this.state.value} onChange={this.handleChange}>
                                <option value="hide">-- Satellites --</option>

                                {this.props.items}
                            </select>
                            <input type="submit" value="Select Satellite"/>
                        </div>
                    </form>
                </div>

            </div>
        );
    }
}

// function useInfoDisplay() {
//     const [items, setItems] = React.useState(null);

//     // React.useEffect(() => {
//     //     fetch('/items')
//     //         .then(r => r.json())
//     //         .then(setItems);
//     // }, []);

//     // const removeItem = () => {
//     //     fetch(`/items/${item.id}`, { method: 'DELETE' }).then(() =>
//     //         onItemRemoval(item),
//     //         );
//     //     };
//     let itemParameters = [];
//     // let itemParameters = items.map((item) =>
//     //     <option key={item} selected>{item.name}</option>
//     // );
//     console.log("hello world");
//     console.log(itemParameters);
//     return (
//         <ParameterDisplay items={itemParameters} />
 
//     );
// }


class ParameterDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {name: '', 
                    sat_num:'', 
                    international_des:'', 
                    epoch:'', 
                    ballistic:'', 
                    drag_term:'', 
                    inclination:'', 
                    ascending_node:'', 
                    eccentricity:'', 
                    perigree:'', 
                    anomaly:'', 
                    motion:'', 
                    rev_num:'', 
                    description:''};
    }
    
    render() {

        return (

            <div id="parameters">
                {/* <dl> */}
                <ul>
                    <h1>HELLO WORLD</h1>
                    {this.props.items}

                </ul>
                {/* </dl> */}
            </div>

        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));