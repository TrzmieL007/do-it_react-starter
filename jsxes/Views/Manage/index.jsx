import React from 'react';
import IndexComponent from '../Classes/IndexComponent';

class Index extends IndexComponent {
    constructor(props){
        super(props);
    }
    renderContent(){
        return <div className="container">
            {this.props.children}
        </div>;
    }
}

module.exports = Index;
