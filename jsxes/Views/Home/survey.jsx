/**
 * Created by trzmiel007 on 07/12/16.
 */
import React from 'react';

class Survey extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (<div className="survey">
            <center>{this.props.params.surveyId}</center>
        </div>);
    }
}

Survey.propTypes = {
    // TODO: Definitions of React.PropTypes
};

/* Uncoment if using scss styles together with the class */
//import scss from './survey.scss';
//import CSSModules from 'react-css-modules';
/** Uncoment this line for use with import keyword **/
//export default CSSModules(Survey,scss);
/** Uncoment this line for use with require(...) function **/
//module.exports = CSSModules(Survey,scss);

/* Uncoment this line for use with import keyword */
//export default Survey;
/* Uncoment this line for use with require(...) function */
module.exports = Survey;
