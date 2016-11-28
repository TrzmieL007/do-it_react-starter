import React, { Component } from 'react';
import CSSModules from 'react-css-modules';

class PopupWindow extends Component {
    constructor(props) {
        super(props);
    }
    bodyClick(ev){
        if(this.props.closeOnOverlay && ev.target == ev.currentTarget) this.props.actions.closeWindow(this.props.id);
    }
    render() {
        return (<div styleName="popupWindow" className={this.props.type} onClick={this.bodyClick.bind(this)}>
            <div styleName="winContent">
                <h1>{this.props.name}</h1>
                <div styleName="closeBtn" onClick={this.props.actions.closeWindow.bind(this,this.props.id)}>&nbsp;</div>
                {this.props.content}
            </div>
        </div>);
    }
}

PopupWindow.propTypes = {
    id: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
    ]).isRequired,
    actions: React.PropTypes.object.isRequired,
    type: React.PropTypes.string.isRequired,
    content: React.PropTypes.node.isRequired,
    name: React.PropTypes.string,
    buttons: React.PropTypes.arrayOf(React.PropTypes.string),
    buttonFunctions: React.PropTypes.arrayOf(React.PropTypes.func),
    onOpen: React.PropTypes.func,
    onClose: React.PropTypes.func,
    styles: React.PropTypes.object,
    closeOnOverlay: React.PropTypes.bool
};

import scsses from './popupWindow.scss';
export default CSSModules(PopupWindow,scsses);