class App extends React.Component {
    constructor(props) {
        super(props);
    }
        render () {
            return (
                <DropdownList />
                // <InfoDisplay />
            );
        }
}


function DropdownList() {
    const [items, setItems] = React.useState(null);
    const [names, setNames] = React.useState(null);
    const [itemInfo, setItemInfo] = React.useState("");
    const {Container} = ReactBootstrap;

    React.useEffect(() => {
        fetch('/names')
            .then(r => r.json())
            .then(setNames);
    }, []);

    React.useEffect(() => {
        fetch('/items')
            .then(r => r.json())
            .then(setItems);
    }, []);

    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key].name === value);
      }
      
    
    function searchItemInfo (searchName) {
        setItemInfo(Object.values(items[getKeyByValue(items,searchName)]));

        console.log(itemInfo);
        return itemInfo;
        
    };



    if (items === null) return 'Loading...';

    let optionItems = names.map((item) =>
        <option key={item} selected>{item.name}</option>
    );

    return (
        <Container> 
            <ItemDisplay 
                names={optionItems}
                items={items}
                onSearchInfo={searchItemInfo} 
            />

        </Container>
        
 
    );
}

class ItemDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {name: '',
                      parameters: {
                      }};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }


    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key].name === value);
      }

    searchItemInfo (searchName) {
        var params = Object.values(this.props.items[this.getKeyByValue(this.props.items,searchName)]);
        this.setState({parameters: params});  
    }

    handleChange(event) {
        this.setState({name: event.target.value});
    }

    handleSubmit(event){
        alert("Searching for satellite: " + this.state.name);
        event.preventDefault(); // prevents page from refreshing

        this.searchItemInfo(this.state.name);
    }



    
    render() {

        let paramKeys = ["Satellite name", 
        "Satellite number", 
        "International designation", 
        "Epoch", 
        "Ballistic", 
        "Drag term", 
        "Inclination", 
        "Ascending node", 
        "Eccentricity", 
        "Perigree", 
        "Anomaly", 
        "Motion", 
        "Revolution number", 
        "Description"]

        var tbody = document.getElementById('infoTable');
        for (var i = 0; i < Object.entries(this.state.parameters).length; i++) {
            var tr = "<tr>";
            tr += "<td>" + paramKeys[i] + "</td>" + "<td>" + Object.entries(this.state.parameters)[i][1] + "</td></tr>";
            tbody.innerHTML += tr;
        }

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

                                {this.props.names}
                            </select>
                            <input type="submit" value="Select Satellite"/>
                        </div>
                    </form>
                </div>

                <div id="parameters">
                </div>  
            </div>


        );
    }
}


ReactDOM.render(<App />, document.getElementById('root'));