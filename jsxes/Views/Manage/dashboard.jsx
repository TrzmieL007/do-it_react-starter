/**
 * Created by trzmiel007 on 05/12/16.
 */
import React from 'react';
import IndexComponent from '../Classes/IndexComponent';

class Dashboard extends IndexComponent {
    constructor(props){
        super(props);
    }
    renderContent(){
        return <div className="container">
            {this.props.children}
        </div>;
    }
}

Dashboard.propTypes = {
    // TODO: Definitions of React.PropTypes
};

/* Uncoment if using scss styles together with the class */
//import scss from './dashboard.scss';
//import CSSModules from 'react-css-modules';
/** Uncoment this line for use with import keyword **/
//export default CSSModules(Dashboard,scss);
/** Uncoment this line for use with require(...) function **/
//module.exports = CSSModules(Dashboard,scss);

/* Uncoment this line for use with import keyword */
//export default Dashboard;
/* Uncoment this line for use with require(...) function */
module.exports = Dashboard;