/**
 * Created by trzmiel007 on 22/12/16.
 */
import React from 'react';

class Spinner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (<div styleName="spinner">
            {document.implementation.hasFeature("http://www.w3.org/2000/svg")
                ? <svg><circle r="30" cx="50%" cy="50%" /></svg> : null}
        </div>);
    }
}

Spinner.propTypes = {
    // TODO: Definitions of React.PropTypes
};

import scss from './spinner.scss';
import CSSModules from 'react-css-modules';
export default CSSModules(Spinner,scss);
