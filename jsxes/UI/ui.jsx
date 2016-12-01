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

class UI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.routes = Navigation.routes;
    }

    componentDidUpdate(){}

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
        var windowses = this.props.windows.reduce((p,w) => {
            p.push(<PopupWindow id={w.id} key={w.id} actions={actions} {...w.props} />); // type={w.windowType||""} name={w.title} content={w.content}
            return p;
        },[]);

        return (
            <div className={"UI "+this.props.appState.theme}>
                {/*<button onClick={this.openWindow.bind(this)}>add window</button><br/>
                <button onClick={this.closeWindow.bind(this)}>close last window</button><br/>
                <button onClick={this.closeAllWindows.bind(this)}>close all windows</button><br/>*/}

                {windowses}
                <Router
                    history={hashHistory}
                    routes={this.routes}
                    createElement={(Component, props) => <Component {...props} {...this.props} actions={actions}>{props.children}</Component>}
                />
            </div>
        );
    }
    openWindow(){
        this.props.dispatch(WindowsActions.openWindow(winid++, 'window '+winid, 'content of the window '+winid+' :)'));
        setTimeout(() => this.props.dispatch(WindowsActions.updateWindow(winid-1,"Updated window",<div>I have just updated this window with setTimeout function :D.<br/>Thanks for watching dude :D</div>)), 2000);
    }
    closeWindow(){
        this.props.dispatch(WindowsActions.closeWindow(--winid));
    }
    closeAllWindows(){
        this.props.dispatch(WindowsActions.closeAllWindows());
    }
}
var winid = 0;

module.exports = connect(state => ({
    appState : state.appState,
    windows : state.windowsState.windows,
    wctime : state.windowsState.wctime,
    locale : new (require('../localize'))('pl')
}))(UI);
