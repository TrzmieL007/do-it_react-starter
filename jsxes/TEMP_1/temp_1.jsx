import React, { Component } from 'react';
import Navigation from '../NavigationTree';

class TEMP_1 extends Component {
    constructor(props) {
        super(props);
    }
    // changeContent(){
    //     this.props.actions.updateWindow(this.props.id,this.props.name,document.getElementById(this.props.id+'newContent').value);
    // }

    render() {
        let c = Navigation.getAllRoutes();
        return (
            <div>
                {/*{this.props.id}) {this.props.name} - {this.props.content}
                <button onClick={this.props.actions.closeWindow.bind(this,this.props.id)}>x</button>
                <input type="text" defaultValue="new content :)" id={this.props.id+'newContent'} />
                <button onClick={this.changeContent.bind(this)}>chk content</button>*/}
                TEMP_1 {this.props.route.path}
                <ul role="nav">{this.mainLinks}</ul>
                <ul role="nav">{this.sideLinks}</ul>
                <pre>{JSON.stringify(c,null,2)}</pre>
            </div>
        );
    }
}
// TEMP_1.propTypes = {
//     id: React.PropTypes.node.isRequired,
//     content: React.PropTypes.node.isRequired,
//     actions: React.PropTypes.object.isRequired,
//     name: React.PropTypes.string
// };

export default TEMP_1;
// module.exports = TEMP_1;