/**
 * Created by trzmiel007 on 04/11/16.
 */

import { combineReducers } from 'redux';
import { CHANGE_CLIENT } from './appActions.js';

const initialAppState = { user: null, clientCode: null };

const dfltAction = { type : null };

function appState(state = initialAppState, action = dfltAction){
    switch(action.type){
        case CHANGE_CLIENT:
            return Object.assign({},state,{clientCode: action.clientCode});
        default:
            return state;
    }
}
function secondTempStore(state = initialAppState, action = dfltAction){
    switch(action.type){
        case CHANGE_CLIENT:
            return Object.assign({},state,{clientCode: action.clientCode});
        default:
            return state;
    }
}

let reducers = combineReducers({ appState, secondTempStore });

module.exports =  reducers;
