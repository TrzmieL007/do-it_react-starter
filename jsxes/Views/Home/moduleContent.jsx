/**
 * Created by trzmiel007 on 28/11/16.
 */
import React from 'react';
import $ from '../../../statics/js/ajax';
import common from '../../commonActions';
import Link from 'react-router/lib/Link';
import Audio from '../Components/audio';

class ModuleContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { moduleInfo : null };
        this.getModule(props.params.id);
    }
    componentWillReceiveProps(props){
        if(this.props.params.id !== props.params.id){
            this.setState({ moduleInfo : null });
            this.getModule(props.params.id);
        }
    }
    shouldComponentUpdate(nextProps, nextState){
        return this.props.params.id !== nextProps.params.id || !common.compareObj(this.state.moduleInfo, nextState.moduleInfo);
    }
    getModule(id){
        $.get('http://localhost:8080/doItAPI/modules',{
            clientCode : this.props.appState.client.clientCode.toLowerCase(),
            id: id || this.props.params.id
        },(res) => this.setState({ moduleInfo : res }));
    }
    render() {
        if(!this.state.moduleInfo) return <span/>;
        let list = this.state.moduleInfo.modules ? this.state.moduleInfo.modules.map((m,i) =>
            <li key={i}>
               <Link data-id={m.id} to={"/assessment/"+m.id.replace(/^s?id/,'')+"?mg="+this.state.moduleInfo.id} className="module-icon-a">
                   <div tabIndex="0" role="button" className="module-icon" data-icon-type="assessment" data-icon-id={m.id.replace(/^s?id/,'')} data-icon-mgid={this.state.moduleInfo.id}>
                       <div className="module-icon-image">
                           <i className={m.icon} style={{fontSize:'6em',marginLeft:0}} />
                       </div>
                       <div className="module-icon-text">
                           {m.name}
                       </div>
                   </div>
               </Link>
           </li>
        ) : <div className="row">
            <div className="col-sm-6 col-md-5 col-lg-4">
                <div id="reportsButton" data-toggle="tooltip" data-placement="bottom" data-original-title="" title="">
                    <a className="btn btn-lg btn-default btn-block disabled" role="button"><i className="icon-book" /> Report</a>
                </div>
            </div>
            <div className="col-sm-6 col-md-5 col-md-offset-2 col-lg-4 col-lg-offset-4">
                <Link to={this.props.route.path.replace(':id',this.state.moduleInfo.startAt)} className="btn btn-lg btn-primary btn-block goto-next-module-group">Start</Link>
            </div>
        </div>;
        return (<div className="tab-content" styleName="content">
            <h2 className="page-header" tabIndex="0" style={{outline: "none"}}>{this.state.moduleInfo.name}</h2>
            <div>
                <Audio src={this.state.moduleInfo.descriptionAudio} />
                {this.state.moduleInfo.description}{this.state.moduleInfo.note ? <div><b>Note</b>{this.state.moduleInfo.note}</div> : null}
            </div>
            {this.props.params.id == 'overview' && this.state.moduleInfo.iframe ?
                <span>
                    <iframe
                        src={this.state.moduleInfo.iframe.src}
                        width={this.state.moduleInfo.iframe.width}
                        height={this.state.moduleInfo.iframeheight}
                        frameBorder="0" />
                    <br/><br/><br/>{list}
                </span>
            :
                <span>
                    <br/><br/>
                    <ul className="module-icons thumbnails">
                        {list}
                    </ul>
                </span>
            }
        </div>);
    }
}

ModuleContent.propTypes = {
    // TODO: Definitions of React.PropTypes
};

/* Uncoment if using scss styles together with the class */
import scss from './moduleContent.scss';
import CSSModules from 'react-css-modules';
//export default CSSModules(ModuleContent,scss);

// export default ModuleContent;
module.exports = CSSModules(ModuleContent,scss);