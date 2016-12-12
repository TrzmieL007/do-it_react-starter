import './ui.scss';
import React from 'react';
// import $ from '../../statics/js/ajax';

import PopupWindow from '../PopupWindow/popupWindow';
import hashHistory from 'react-router/lib/hashHistory';
import Router from 'react-router/lib/Router';
import Navigation from '../NavigationTree';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AppStoreActions from '../FluxImpl/appStoreActions';
import * as WindowsActions from '../FluxImpl/windowsStoreActions';
import $ from '../../statics/js/ajax';
import { Storage } from '../Utils/utils';

class UI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.routes = Navigation.routes;
        $.get('http://localhost:8080/doItAPI/assessments', {
            clientCode: props.appState.client.clientCode.toLowerCase()
        },res => {
            Object.keys(res).forEach(c => Storage.setItem('assId_'+c,res[c]));
        });
    }

    componentWillReceiveProps(nextProps){
        if(this.props.appState.theme != nextProps.appState.theme)
            document.getElementById('frontend-theme-stylesheet').href = "/Content/frontend-themes/theme-"+nextProps.appState.theme+".min.css";
        if(this.props.wctime != nextProps.wctime) this.forceUpdate();
    }

    render() {
        let actions = Object.assign({},
            bindActionCreators(AppStoreActions, this.props.dispatch),
            bindActionCreators(WindowsActions, this.props.dispatch)
        );
        let windowses = this.props.windows.reduce((p,w) => {
            p.push(<PopupWindow id={w.id} key={w.id} actions={actions} {...w.props} />);
            return p;
        },[]);
        return (
            <div className={"UI "+this.props.appState.theme}>
                {windowses}
                <Router
                    history={hashHistory}
                    routes={this.routes}
                    createElement={(Component, props) => <Component {...props} {...this.props} actions={actions}>{props.children}</Component>}
                />
            </div>
        );
    }
}

module.exports = connect(state => ({
    appState : state.appState,
    windows : state.windowsState.windows,
    wctime : state.windowsState.wctime,
    locale : new (require('../Utils/localize'))('pl')
}))(UI);
