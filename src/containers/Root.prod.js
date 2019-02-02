import React, { Component } from 'react';
import { Provider } from 'react-redux';
import {BrowserRouter as Router, Link} from 'react-router-dom';
import Routes from '../routes'
import App from "./app";

export default class Root extends Component {
    render() {
        const { store } = this.props;
        return (
            <Provider store={store}>
                <App/>
                <Router>
                    <Routes />
                </Router>
            </Provider>
        );
    }
}