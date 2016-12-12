/**
 * Created by trzmiel007 on 09/12/16.
 */
import React from 'react';


class Progress extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return <div className="col-sm-6 col-md-5 col-lg-4">
            <div className="progress-container">
                <div className="question-number pull-left">
                    {this.props.question}/{this.props.totalQuestions}
                </div>
                <div className="progress hidden-xs">
                    <div id="progress-bar" className="progress-bar" style={{width:((this.props.question*100)/this.props.totalQuestions)+'%'}} />
                </div>
            </div>
        </div>;
    }
}

Progress.propTypes = {
    question: React.PropTypes.number,
    totalQuestions: React.PropTypes.number
};

/* Uncoment if using scss styles together with the class */
//import scss from './progress.scss';
//import CSSModules from 'react-css-modules';
/** Uncoment this line for use with import keyword **/
//export default CSSModules(Progress,scss);
/** Uncoment this line for use with require(...) function **/
//module.exports = CSSModules(Progress,scss);

/* Uncoment this line for use with import keyword */
export default Progress;
/* Uncoment this line for use with require(...) function */
// module.exports = Progress;
