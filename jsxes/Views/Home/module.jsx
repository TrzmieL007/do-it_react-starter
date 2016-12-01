import React from 'react';

class Modules extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return <div className="row">
            {/* Here goes side menu */}
            {this.props.sideMenu}
            <div className="col-sm-8 col-md-8 col-lg-9">
                {/* Here goes content of the module */}
                {this.props.content}
            </div>
        </div>;
    }
}

// export default AdvancedTools;
module.exports = Modules;