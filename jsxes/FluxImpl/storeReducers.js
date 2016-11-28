/**
 * Created by trzmiel007 on 16/11/16.
 */

import { combineReducers } from 'redux';
import * as As from './appStoreActions';
import * as Ws from './windowsStoreActions';
import common from '../commonActions';

const initialAppState = {
    client: common.getClientData(),
    user: common.getUserData('email','name')
};
const dfltAction = { type : null };

function windowsState(state = { windows : [] }, action = dfltAction){
    let obj = Object.assign({}, state, { wctime : +(new Date()) });
    switch(action.type){
        case Ws.OPEN_WINDOW:
            return Object.assign(obj, {
                windows: [{
                    id: action.id,
                    title: action.title,
                    content: action.content
                }].concat(state.windows)
            });
        case Ws.CLOSE_WINDOW:
            return Object.assign(obj, { windows : state.windows.filter(win => win.id !== action.id) });
        case Ws.UPDATE_WINDOW:
            return Object.assign(obj, {
                windows : state.windows.map(w => w.id == action.id ? {
                    id: action.id,
                    title: action.title,
                    content: action.content
                } : w)
            });
        case Ws.CLOSE_ALL_WINDOWS:
            return Object.assign(obj, { windows : [] });
        default:
            return state;
    }
}

function appState(state = initialAppState, action = dfltAction){
    switch(action.type){
        case As.CHANGE_CLIENT_CODE:
            return Object.assign({}, state, { clientCode : action.clientCode });
        default:
            return state;
    }
}

export default combineReducers({ appState, windowsState });