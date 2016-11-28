import React from 'react';

class Standalone extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return <code>{this.props.route.path}</code>;
    }
}

// export default Standalone;
module.exports = Standalone;