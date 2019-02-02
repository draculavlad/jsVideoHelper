import React from 'react';
import NavBar from "./navBar";


import '../style/roboto-300-400-500.css'
import Tool from "./tool";

class App extends React.Component {

    render() {
        const { store } = this.props;


        return (
            <div>
                <NavBar />
                <Tool />
            </div>
        );
    }
}

export default App