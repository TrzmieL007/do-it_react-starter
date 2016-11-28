import React from 'react';
import { Provider } from 'react-redux';
import setup from './setup';
import store from '../store';

// setup(alt);

React.Perf = require('react-addons-perf');

module.exports = ({children}) => {
    return (<Provider store={store}>
        {children}
    </Provider>);
};