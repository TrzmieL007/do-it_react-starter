/**
 * Created by trzmiel007 on 28/11/16.
 */
import React from 'react';

class ModuleContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { moduleInfo : null };
        this.getModule(props.params.id);
    }
    shouldComponentUpdate(nextProps, nextState){
        let should = this.props.params.id !== nextProps.params.id || this.state.moduleInfo !== nextState.moduleInfo;
        console.log("should component update: %o",should);
        return should;
    }
    getModule(id){
        $.get('http://localhost:8080/doItAPI/modules',{
            clientCode : this.props.appState.client.clientCode.toLowerCase(),
            id: id || this.props.params.id
        },(res) => this.setState({ moduleInfo : res }));
    }
    render() {
        return (<div className="moduleContent">
            Module content: <pre>{JSON.stringify(this.state.moduleInfo,null,4)}</pre>
        </div>);
    }
}

ModuleContent.propTypes = {
    // TODO: Definitions of React.PropTypes
};

/* Uncoment if using scss styles together with the class */
//import scss from './moduleContent.scss';
//import CSSModules from 'react-css-modules';
//export default CSSModules(ModuleContent,sass);

// export default ModuleContent;
module.exports = ModuleContent;