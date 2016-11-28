import React from 'react';

class Reports extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return <code>{this.props.route.path}</code>;
    }
}

// export default Reports;
module.exports = Reports;