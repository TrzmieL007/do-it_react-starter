/**
 * Created by trzmiel007 on 28/11/16.
 */
import React from 'react';
import Link from 'react-router/lib/Link';
import $ from '../../../statics/js/ajax';
import common from '../../commonActions';

class SideMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = { listOfModules : [] };
        this.getListOfModules();
        this.client = common.getClientData();
    }
    componentWillReceiveProps(props){
        if(this.props.params.id !== props.params.id){
            this.forceUpdate();
        }
    }
    shouldComponentUpdate(nextProps, nextState){
        return this.props.params.id !== nextProps.params.id || !common.compareObj(this.state.listOfModules, nextState.listOfModules);
    }

    getListOfModules(){
        $.get('http://localhost:8080/doItAPI/modulesList',{ clientCode : this.props.appState.client.clientCode.toLowerCase() },(res)=>{
            this.setState({ listOfModules : res });
        });
    }

    render() {
        let links = this.state.listOfModules.map((m,i) => <li key={i} className={(m.id=='overview'?'':"nav-notgrouped")+(m.id==this.props.params.id?" active":"")}>
            <Link to={this.props.route.path.replace(':id',m.id)} aria-expanded={(m.id==this.props.params.id).toString()}>
                <i className="icon-chevron-right" />{m.name}
                {m.modules?<span className="pull-right text-info">{m.completed||0} / {m.modules}</span>:null}
            </Link>
        </li>);
        return (<div className="sideMenu col-sm-4 col-md-4 col-lg-3">
            {/* If there is a logo */}
            {this.client.image ? <div className="panel panel-default" style={{padding: "15px 0 20px 0", marginBottom:-8}}>
                <div className="text-center">
                    <img src={this.client.image} alt={this.client.name+" Logo"} />
                </div>
            </div> : null}
            <ul className="nav nav-list sidebar-nav" id="navtabs" style={{marginBottom:8}}>
                {links}
            </ul>

            <div className="panel panel-info">
                <div className="panel-heading">
                    <h3 className="panel-title">Your report</h3>
                </div>
                <div className="panel-body">
                    {/* Here will go some content later */}
                    <p>You have not completed a module yet, reports are not available.</p>
                </div>
            </div>
        </div>);
    }
}

SideMenu.propTypes = {
    // TODO: Definitions of React.PropTypes
};

/* Uncoment if using scss styles together with the class */
//import scss from './sideMenu.scss';
//import CSSModules from 'react-css-modules';
//export default CSSModules(SideMenu,sass);

// export default SideMenu;
module.exports = SideMenu;