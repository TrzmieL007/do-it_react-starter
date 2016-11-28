import React from 'react';

class AdvancedTools extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return <code>{this.props.route.path}</code>;
    }
}

// export default AdvancedTools;
module.exports = AdvancedTools;