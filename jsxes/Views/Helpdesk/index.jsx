import IndexComponent from '../Classes/IndexComponent';
import React from 'react';

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

// export default Index;
module.exports = Index;