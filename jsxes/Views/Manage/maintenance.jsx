import React from 'react';

class Maintenance extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return <code>{this.props.route.path}</code>;
    }
}

// export default Maintenance;
module.exports = Maintenance;