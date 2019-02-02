import React from 'react';
import { render } from 'react-dom';

import Root from './containers/Root';

import configStore from './redux/store/configStore';


const store = configStore();

render(
    <Root store={store}/>,
    document.getElementById('root')
);