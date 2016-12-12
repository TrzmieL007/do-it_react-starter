/**
 * Created by trzmiel007 on 07/12/16.
 */
import React from 'react';
import { Storage } from '../../../Utils/utils';
import hashHistory from 'react-router/lib/hashHistory';
import Question from './question';
import Introduction from './introduction';
import Progress from './progress';

class Assessment extends React.Component {
    constructor(props) {
        super(props);
        this.state = { question : 0, soundOn : true, debug : false };
        this.assessment = null;
    }
    getAssessment(id){
        return Storage.getItem('assId_'+(id || this.props.params.assessmentId));
    }
    getSounds(o){
        return Object.keys(o).reduce((p,c)=>{
            if(!o[c]) return p;
            if(typeof o[c] == 'object') return p.concat(this.getSounds(o[c]));
            if(typeof o[c] == 'string' && o[c].match(/sounds\/[^.]+\.[mp3og]{3}/ig)) p.push({ [c] : o[c] });
            return p;
        },[]);
    }
    getImages(o){
        return Object.keys(o).reduce((p,c)=>{
            if(!o[c]) return p;
            if(typeof o[c] == 'object') return p.concat(this.getImages(o[c]));
            if(typeof o[c] == 'string' && o[c].match(/images\/[^.]+\.[pngje]{3,4}/ig)) p.push({ [c] : o[c] });
            return p;
        },[]);
    }
    stripAssessmentData(assessment){
        return Object.assign({},assessment,{ AssessmentQuestions : undefined });
    }
    handleQuestionSubmit(data){
        // TODO: aomething with the data :)
        this.goToNextQuestion();
    }
    goToNextQuestion(){
        this.setState({ question : ++this.state.question });
    }

    render() {
        let ass = this.getAssessment();
        if(!ass){
            this.interval = setInterval(()=>(this.getAssessment()?this.forceUpdate():null),128);
            return <div styleName="spinner" />;
        }
        if(this.interval){
            clearInterval(this.interval);
            this.interval = null;
        }
        return <div>
            <div className="container main">
                <link rel="stylesheet" href="/Content/other/assessment-v4.css" />
                <header>
                    <div className="row">
                        <Progress question={this.state.question} totalQuestions={ass.NumberOfQuestions} />
                        <Menu soundOn={this.state.soundOn} canMute={ass.AllowMute} canReplay={ass.SoundReplay} />
                    </div>
                </header>
                <div id="body">
                    {this.state.question
                        ? this.state.question <= ass.NumberOfQuestions
                            ? <Question
                                question={ass.AssessmentQuestions[this.state.question-1]}
                                next={this.handleQuestionSubmit.bind(this)}
                                lastQuestion={this.state.question == ass.NumberOfQuestions}
                                assessment={this.stripAssessmentData(ass)}
                                debugMode={this.state.debug}
                            />
                            : <h2 style={{color:'red',width:'100%',textAlign:'center'}}>Finished</h2>
                        : <Introduction intro={ass.IntroductionText} start={this.goToNextQuestion.bind(this)} audio={ass.IntroductionTextSoundFile} autoplay={ass.SoundAuto} audioButton={ass.ShowPlaySoundButton} />}
                </div>
                <footer>
                    <section className="clearfix">
                        <span id="lblTest" style={{fontWeight:'bold'}}>{ass.Title.replace(/\s?\([^)]+\)/,'')}</span>
                    </section>
                </footer>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col-sm-12"><br/>
                        <div>
                            <a className="btn btn-default" onClick={this.accessabilityOptions.bind(this)}>
                                <i className="icon-adjust" />
                                <span> </span>
                                <span>Accessibility Options</span>
                            </a>
                        </div>
                        <div className="btn-group">
                            <button className={"btn btn-primary"+(this.state.debug?"":" active")} onClick={this.debugOff.bind(this)}>Standard</button>
                            <button className={"btn btn-primary"+(this.state.debug?" active":"")} onClick={this.debugOn.bind(this)}>Debug</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
    debugOn(){ this.setState({ debug : true }); }
    debugOff(){ this.setState({ debug : false }); }
    accessabilityOptions(){
    let id = "AccessibilityOptionsWindow";
    let getContent;
    let themeChange = c => {
        this.props.actions.changeTheme(c);
        this.props.actions.updateWindow(
            id,
            this.props.locale.getLocaleString("AccessibilityOptions"),
            getContent(),
            undefined,
            { style : { maxWidth : 555 } }
        );
    };
    let dangerousHTML = {
        __html : this.props.locale.getLocaleString("AccessibilityOptions_AdjuctingTextSize_Info")
            .replace(/CTRL/g,navigator.platform.toString().indexOf("Mac") > -1 ? "Command" : "Ctrl")
    };
    let colors = ["default","white","pastelorange","pastelturquoise","pastelpurple","pastelgreen","pastelblue","blue","hivis","blackyellow","yellowblack"];
    getContent = () => {
        let buttons = colors.map((c,i) => <label onClick={themeChange.bind(this,c)} key={i}
                                                 className={"btn btn-default btn-lg theme-" + c + (this.props.appState.theme == c ? " active" : "")}>
            <input type="radio" name="options" defaultChecked={this.props.appState.theme == c} /> A<span className="sr-only"> - switch to {c} theme</span>
        </label>);
        return <span>
            <h3>{this.props.locale.getLocaleString("AccessibilityOptions_Colour")}</h3>
            <div id="themes" style={{textAlign:'center'}}>
                <div className="btn-group" data-toggle="buttons">
                    {buttons}
                </div>
                <div className="clear-fix"></div>
            </div>
            <h3>{this.props.locale.getLocaleString("AccessibilityOptions_AdjustingTextSize")}</h3>
            <span dangerouslySetInnerHTML={dangerousHTML} />
        </span>;
    };
    this.props.actions.openWindow(
        id,
        this.props.locale.getLocaleString("AccessibilityOptions"),
        getContent(),
        undefined,
        { style : { maxWidth : 555 } }
    );
    }
}

Assessment.propTypes = {
    // TODO: Definitions of React.PropTypes
};

/* Uncoment if using scss styles together with the class */
import scss from './assessment.scss';
import CSSModules from 'react-css-modules';
/** Uncoment this line for use with import keyword **/
//export default CSSModules(Assessment,scss);
/** Uncoment this line for use with require(...) function **/
module.exports = CSSModules(Assessment,scss);

/* Uncoment this line for use with import keyword */
//export default Assessment;
/* Uncoment this line for use with require(...) function */
// module.exports = Assessment;

class Menu extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return <div className="col-sm-6 col-md-7 col-lg-8">
            <ul className="controls pull-right">
                <li className={this.props.canReplay?"":'hidden'}><a data-toggle="tooltip" data-placement="bottom" title="Replay Sound"><i className="fa fa-undo fa-2x" /></a></li>
                <li className={this.props.canMute&&!this.props.soundOn?"":'hidden'}><a data-toggle="tooltip" data-placement="bottom" title="Turn Sound On"><i className="fa fa-volume-off fa-2x" /></a></li>
                <li className={this.props.canMute&&this.props.soundOn?"":'hidden'}><a data-toggle="tooltip" data-placement="bottom" title="Turn Sound Off"><i className="fa fa-volume-up fa-2x" /></a></li>
                <li>
                    <a data-toggle="tooltip" data-placement="bottom" title="Exit" onClick={hashHistory.goBack}><i className="fa fa-sign-out fa-2x" /></a>
                </li>
            </ul>
        </div>;
    }
}