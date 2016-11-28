import React from 'react';

class Summary extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return <code>{this.props.route.path}</code>;
    };
}

// export default List;
module.exports = Summary;