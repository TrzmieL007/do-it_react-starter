/**
 * Created by trzmiel007 on 28/11/16.
 */
import React from 'react';
import Link from 'react-router/lib/Link';
import $ from '../../../statics/js/ajax';
import common from '../../Utils/commonActions';
import { Storage } from '../../Utils/utils';

class SideMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = { listOfModules : [] };
        this.client = common.getClientData();
    }
    componentDidMount(){
        this.mounted = true;
        this.getListOfModules();
    }
    componentWillUnmount(){
        this.mounted = false;
    }
    componentWillReceiveProps(props){
        if(this.props.params.id !== props.params.id){
            this.forceUpdate();
        }
    }
    /*shouldComponentUpdate(nextProps, nextState){
        return this.props.params.id !== nextProps.params.id || !common.compareObj(this.state.listOfModules, nextState.listOfModules);
    }*/
    sortingModules(o1,o2){
        return o1.id == 'overview' ? -1 : o2.id == 'overview' ? 1 : o1.id - o2.id;
    }
    getListOfModules(){
        // [{"APIAccessKey":null,"BrandingText":null,"IntroductionText":"<p><a href=\"https://doitcdn.azureedge.net/shared/sounds/dyslexia+/it.mp3\" title=\"Hear text aloud\" class=\"sm2_button\">sounds</a> Welcome to Dyslexia+. Below is our introductory video. You may wish to review it before you start.</p>\r\n\r\n<iframe src=\"https://player.vimeo.com/video/183620824\" width=\"640\" height=\"361\" frameborder=\"0\" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>\r\n","Tests":"567,572,905,1032,1053,842,592,674,985,983,1042","Name":"Dyslexia+","HasLogo":true,"ClientId":1067}]
        // [{"AssessmentId":567,"ModuleGroupId":2381,"MinimumAge":0,"MaximumAge":999,"DisplayOrder":0}]
        // ModuleGroupId - Do którego module group należy :)
        // DisplayOrder - W jakiej kolejności w grupie występuje :)
        // ClientId - jak nazwa wskazuje
        // AssessmentId - id konkretnego assessmentu
        let ms = Storage.getItem('modules');
        ms = ms ? Object.keys(ms).map(m => ms[m]).sort(this.sortingModules) : [];
        this.setState({listOfModules:ms});
        let lom = { overview : { id : 'overview', name : "Overview" } };
        $.ajax({
            url: '/ClientAssessment',
            data: { '$filter' : 'ClientId eq '+Storage.getItem('clientData').ClientId },
            authenticate: 1,
            done: d => {
                if(!this.mounted) return;
                if(Array.isArray(d)) {
                    lom = d.reduce((p,a,i) => {
                        if(a.DisplayOrder == 999) a.DisplayOrder = i;
                            if(p.hasOwnProperty(a.ModuleGroupId)){
                                ++p[a.ModuleGroupId].modules;
                                p[a.ModuleGroupId].assessments.push({ id : a.AssessmentId, order : a.DisplayOrder });
                            } else p[a.ModuleGroupId] = {
                                id : a.ModuleGroupId,
                                modules : 1,
                                name : "Modules",
                                completed : 0,
                                assessments : [{ id : a.AssessmentId, order : a.DisplayOrder }],
                                surveys : []
                            };
                            return p;
                        },lom);
                    $.ajax({
                        url: '/ClientSurvey',
                        data: { '$filter' : 'ClientId eq '+Storage.getItem('clientData').ClientId },
                        authenticate: 1,
                        done: d => {
                            if(Array.isArray(d)){
                                d.reduce((p,s,i) => {
                                    if(s.DisplayOrder == 999) s.DisplayOrder = i+Object.keys(lom).length;
                                    if(p.hasOwnProperty(s.ModuleGroupId)){
                                        ++p[s.ModuleGroupId].modules;
                                        p[s.ModuleGroupId].surveys.push({ sid : s.SurveyId, order : s.DisplayOrder });
                                    }
                                    else p[s.ModuleGroupId] = {
                                        id : s.ModuleGroupId,
                                        modules : 1,
                                        name : "Modules",
                                        completed : 0,
                                        assessments : [],
                                        surveys : [{ sid : s.SurveyId, order : s.DisplayOrder }]
                                    };
                                    return p;
                                },lom);
                            }
                            this.setState({listOfModules: Object.keys(Storage.setItem('modules',lom)).map(m => lom[m]).sort(this.sortingModules)});
                            Object.keys(lom).forEach(gid => gid=="overview"?null:$.ajax({
                                url: '/ModuleGroupLocalised',
                                data: { '$filter' : 'ModuleGroupId eq '+gid },
                                authenticate: 1,
                                headers: { ClientCode : Storage.getItem('clientCode') },
                                done: d => {
                                    let mgl = d[0];
                                    let module = lom[mgl.ModuleGroupId];
                                    module.description = mgl.Description;
                                    module.descriptionSoundFile = mgl.DescriptionSoundFile;
                                    module.name = mgl.Name;
                                    module.reportDescription = mgl.ReportDescription;
                                    this.setState({listOfModules: Object.keys(Storage.setItem('modules',lom)).map(m => lom[m]).sort(this.sortingModules)});
                                }
                            }));
                        },
                        fail: () => this.setState({listOfModules: Object.keys(Storage.setItem('modules',lom)).map(m => lom[m]).sort(this.sortingModules)})
                    });
                }
            },
            fail: (res,stat,err) => {
                console.error("response: %o,\nstatusCode: %o,\nerror: %o",res,stat,err);
                this.setState({listOfModules:ms});
            }
        });
        //
        // $.get('http://localhost:8080/doItAPI/modulesList',{ clientCode : this.props.appState.client.clientCode.toLowerCase() },(res)=>{
        //     this.setState({ listOfModules : res });
        // });
    }

    render() {
        let links = this.state.listOfModules.map((m,i) => <li key={i} className={(m.id=='overview'?'':"nav-notgrouped")+(m.id==this.props.params.id?" active":"")}>
            <Link to={this.props.route.path.replace(':id',m.id)}>
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