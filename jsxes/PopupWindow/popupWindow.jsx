import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import CSSModules from 'react-css-modules';
import scsses from './popupWindow.scss';

class PopupWindow extends Component {
    constructor(props) {
        super(props);
    }
    bodyClick(ev){
        if(this.props.closeOnOverlay && ev.target == ev.currentTarget) this.onBeforeClose();
    }
    onBeforeClose(){
        if(this.props.onClose){
            if(typeof this.props.onClose == 'function') {
                new Promise(resolve => {
                    this.props.onClose();
                    resolve();
                }).then(this.closeWindow).catch(this.closeWindow);
            }else if(this.props.onClose.constructor.name == "Promise"){
                this.props.onClose().then(this.closeWindow);
            }
        }else{
            this.closeWindow();
        }
    }
    closeWindow(){
        ReactDOM.findDOMNode(this).classList.add("closing");
        setTimeout(()=>this.props.actions.closeWindow(this.props.id),512);
    }
    render() {
        return (<div styleName="popupWindow" className={this.props.type} onClick={this.bodyClick.bind(this)}>
            <div styleName="winContent" style={this.props.style}>
                <div styleName="winHeader">
                    <div styleName="closeBtn" onClick={this.onBeforeClose.bind(this)}>&nbsp;</div>
                    <h3 styleName="winTitle">{this.props.name}</h3>
                </div>
                <div styleName="winBody">
                    {this.props.content}
                </div>
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
    buttons: React.PropTypes.arrayOf(React.PropTypes.string),                           // to be implemented
    buttonFunctions: React.PropTypes.arrayOf(React.PropTypes.func),                     // to be implemented
    onOpen: React.PropTypes.func,                                                       // to be implemented
    onClose: React.PropTypes.oneOfType([React.PropTypes.func,React.PropTypes.object]),
    styles: React.PropTypes.object,
    closeOnOverlay: React.PropTypes.bool,
};

export default CSSModules(PopupWindow,scsses);