/**
 * Created by trzmiel007 on 16/11/16.
 */

import { combineReducers } from 'redux';
import * as As from './appStoreActions';
import * as Ws from './windowsStoreActions';
import common from '../Utils/commonActions';

const initialAppState = {
    client: common.getClientData(),
    user: common.getUserData('email','name'),
    theme: "default"
};
const dfltAction = { type : null };

function windowsState(state = { windows : [] }, action = dfltAction){
    let obj = Object.assign({}, state, { wctime : +(new Date()) });
    switch(action.type){
        case Ws.OPEN_WINDOW:
            return Object.assign(obj, {
                windows: [{
                    id: action.id,
                    props: action.props
                }].concat(state.windows)
            });
        case Ws.CLOSE_WINDOW:
            return Object.assign(obj, { windows : state.windows.filter(win => win.id !== action.id) });
        case Ws.UPDATE_WINDOW:
            return Object.assign(obj, {
                windows : state.windows.map(w => w.id == action.id ? {
                    id: w.id,
                    props: Object.assign({},w.props,action.props)
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
        case As.CHANGE_THEME:
            return Object.assign({}, state, { theme : action.theme });
        default:
            return state;
    }
}

export default combineReducers({ appState, windowsState });