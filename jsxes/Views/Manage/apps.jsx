import React from 'react';

class Apps extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return <code>{this.props.route.path}</code>;
    }
}

// export default Apps;
module.exports = Apps;