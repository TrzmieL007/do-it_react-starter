/**
 * Created by trzmiel007 on 28/11/16.
 */
import React from 'react';
import $ from '../../../statics/js/ajax';
import common from '../../Utils/commonActions';
import Link from 'react-router/lib/Link';
import Audio from '../Components/audio';
import { Storage, dataFetch } from '../../Utils/utils';

import Reactify from '../../Utils/reactify';

class ModuleContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { moduleInfo : null };
    }
    componentWillReceiveProps(props){
        if(this.props.params.id !== props.params.id){
            $.abortAllUnfinishedCalls('ModuleContent');
            this.setState({ moduleInfo : null });
            this.getModule(props.params.id.toString());
        }
    }
    componentDidMount(){
        this.getModule(this.props.params.id);
    }
    componentWillUnmount(){
        $.abortAllUnfinishedCalls('ModuleContent');
        this.mounted = false;
    }

    getModule(id){
        id = !id && id != 0 ? this.props.params.id : id;
        let modules = Storage.getItem('modules');
        if(id == 'overview'){
            let description = Reactify(Storage.getItem('clientData').IntroductionText || "<p>There are a number of modules in different folders to complete which will help to highlight both your strengths and your challenges.</p><p>After you have completed a module you will be provided with some guidance and resources. </p><p>Try to do them in the order they appear in the folders.</p><p>When you are ready click 'Start'.</p>");
            let startAt = modules && Object.keys(modules).length > 1 ? Object.keys(modules).sort()[0] : null;
            this.setState({ moduleInfo : { name : "Welcome to Do-IT Profiler", description, startAt }});
        }else{
            if(!modules) setTimeout(this.getModule.bind(this),512);
            this.setState({moduleInfo : {
                name: modules[id].name,
                description: modules[id].description,
                descriptionAudio: modules[id].descriptionSoundFile ? common.getSourceURL()+modules[id].descriptionSoundFile : null,
                modules: []
            }});
            /*modules[id].surveys.forEach(survey => {
                $.ajax({
                    url: "/Survey/"+survey.sid,
                    authenticate: 1,
                    headers: { ClientCode : Storage.getItem('clientCode') },
                    done: d => {
                        // console.log(d);
                        let moduleInfo = Object.assign({},this.state.moduleInfo);
                        moduleInfo.modules.push({
                            name: d.IconName,
                            id: 'sid'+d.SurveyId,
                            order: survey.order,
                            icon: {
                                name: d.IconFontName,
                                size: d.IconFontSize,
                                offs: d.IconFontMarginOffset,
                                file: d.IconImageFile
                            }
                        });
                        this.setState({ moduleInfo });
                        Storage.setItem('sid'+d.SurveyId,d);
                    },
                    register: 'ModuleContent'
                    // always: (a,b)=>console.log('survey %o,\nstatus %o',survey,b)
                });
            });*/
            /*modules[id].assessments.forEach(assessment => {
                $.ajax({
                    url: "/Assessment/"+assessment.id,
                    authenticate: 1,
                    headers: { ClientCode : Storage.getItem('clientCode') },
                    done: d => {
                        // console.log(d);
                        let moduleInfo = Object.assign({},this.state.moduleInfo);
                        moduleInfo.modules.push({
                            name: d.IconName,
                            id: 'id'+d.Id,
                            order: assessment.order,
                            icon: {
                                name: d.IconFontName,
                                size: d.IconFontSize,
                                offs: d.IconFontMarginOffset,
                                file: d.Icon
                            }
                        });
                        this.setState({ moduleInfo });
                        Storage.setItem('id'+d.Id,d);
                    },
                    register: 'ModuleContent'
                    //always: (a,b)=>console.log('status %o',b)
                });
            });*/
            dataFetch.getData({
                endpoint: "Test",
                data: { "$filter" : "TestId eq 9" },
                callerName: 'ModuleContent',
                storeName: 'assessmentHeader-id9',
                success: d => (console.log(d),d)
            });
            modules[id].assessments.forEach(assessment => {
                $.ajax({
                    url: "/Test",
                    data: { "$filter" : "TestId eq "+assessment.id },
                    authenticate: 1,
                    done: d => {
                        let ass = d[0];
                        let moduleInfo = Object.assign({},this.state.moduleInfo);
                        moduleInfo.modules.push({
                            name: ass.IconName,
                            id: 'id'+ass.TestId,
                            order: assessment.order,
                            icon: {
                                name: ass.IconFontName,
                                size: ass.IconFontSize,
                                offs: ass.IconFontMarginOffset,
                                file: ass.Icon
                            }
                        });
                        this.setState({ moduleInfo });
                        Storage.setItem('assessmentHeader-id'+d.TestId,ass);
                    },
                    register: 'ModuleContent'
                    //always: (a,b)=>console.log('status %o',b)
                });
            });
        }
    }
    render() {
        if(!this.state.moduleInfo) return <span />;
        let list = this.state.moduleInfo.modules ? this.state.moduleInfo.modules.sort((o1,o2)=>o1.order-o2.order).map(m =>
            <li key={m.id}>
               <Link data-id={m.id} to={(m.id.match(/^sid[0-9]+/)?"/survey/":"/assessment/")+m.id.replace(/^s?id/,'')} className="module-icon-a">
                   <div tabIndex="0" role="button" className="module-icon">
                       <div className="module-icon-image">
                           <i className={m.icon.name} style={{fontSize:m.icon.size+'em',marginLeft:m.icon.offs+'px'}} />
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
            {this.state.moduleInfo.name?<h2 className="page-header" tabIndex="0" style={{outline: "none"}}>{this.state.moduleInfo.name}</h2>:null}
            <div>
                {this.state.moduleInfo.descriptionAudio?<Audio src={this.state.moduleInfo.descriptionAudio} preload="auto" />:null}
                {this.state.moduleInfo.description}
            </div>
            <span>
                <ul className="module-icons thumbnails">
                    {list}
                </ul>
            </span>
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