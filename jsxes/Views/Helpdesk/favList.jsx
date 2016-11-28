import React from 'react';

class FavList extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return <code>{this.props.route.path}</code>;
    }
}

// export default Index;
module.exports = FavList;