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


class DropdownList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items:["one", "two", "three"]
        };
    }
    // const [items, setItems] = React.useState(null);

    // React.useEffect(() => {
    //     fetch('/items')
    //         .then(r => r.json())
    //         .then(setItems);
    // }, []);


    // if (this.state.items === null) return 'Loading...';
    render() {
        return (
            // console.log(this.state.items)
            // {this.state.items.length === 0 && (
            //     <p className="text-center">No satellites in database</p>
            // )}
            <ItemDisplay items={this.state.items}/>
                // ))}
        );
    }
}

class ItemDisplay extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {

        let optionItems = this.props.items.map((item) => 
            <option key={item}>{item}</option>
        );

        return (
            // <DropdownButton id="dropdown-basic-button" title="Satellite List">
            //     <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
            //     <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
            //     <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>        
            // </DropdownButton>
            // {<Dropdown>
            //     <Dropdown.Toggle variant="success" id="dropdown-basic">
            //         Dropdown Button
            // </Dropdown.Toggle>

            //     <Dropdown.Menu>
            //         <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
            //         <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
            //         <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
            //     </Dropdown.Menu>
            // </Dropdown>}
            // console.log(this.props.items);
            <div>
                <div id="instructions">
                    <h1>Instructions:</h1>
                    <li>Select a satellite from the dropdown list</li>
                </div>

                <div>
                    <select id="sat_dropdown">
                        {optionItems}
                    </select>
                </div>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
