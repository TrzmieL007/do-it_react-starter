/**
 * Created by trzmiel007 on 07/12/16.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Storage } from '../../../Utils/utils';
import hashHistory from 'react-router/lib/hashHistory';
import Question from './question';
import Introduction from './introduction';
import Progress from './progress';
import Audio from '../../Components/audio';
import common from '../../../Utils/commonActions';
import Spinner from '../../Components/spinner';

class Assessment extends React.Component {
    constructor(props) {
        super(props);
        this.state = { question : 0, soundOn : true, debug : false, loadedImages : 0, totalImages : null, loadedSounds : 0, totalSounds : null };
        this.init(props.params.assessmentId,true);
    }
    componentWillReceiveProps(newProps){
        if(this.props.params.assessmentId !== newProps.params.assessmentId){
            this.init(newProps.params.assessmentId);
        }
    }
    shouldComponentUpdate(newProps,newState){
        if(this.state.replaySound && !newState.replaySound) return false;
        if(this.questionSounds[newState.question-1] && (this.state.question != newState.question || newState.replaySound)) this.questionSounds[newState.question-1].node.playAudio();
        return true;
    }
    componentDidUpdate(){
        if(this.state.replaySound) this.state.replaySound = undefined;
    }
    init(id,constr){
        this.assessment = this.getAssessment(id);
        if(this.assessment){
            this.questionSounds = [];
            this.introductionSound = {};
            this.sounds = this.getSounds(this.assessment).map(snd => {
                let key = Object.keys(snd)[0];
                let path = key.split('.');
                if(path[0]=='IntroductionTextSoundFile')
                    return this.introductionSound.react = <Audio key={key} src={common.getSourceURL() + snd[key]} hidden={true} preload="auto"
                                                                 onCanPlayThrough={() => this.setState({loadedSounds: ++this.state.loadedSounds})}
                                                                 ref={e=> this.introductionSound.node = e} autoplay={this.assessment.SoundAuto}
                                                          />, null;
                if(path[0]=='AssessmentQuestions' && path[2]=='QuestionSound'){
                    this.questionSounds[path[1]] = {
                        react: <Audio key={key} src={common.getSourceURL() + snd[key]} hidden={true}
                                      onCanPlayThrough={() => this.setState({loadedSounds: ++this.state.loadedSounds})}
                                      onPlay={()=>++this.questionSounds[path[1]].replayCount}
                                      ref={e => this.questionSounds[path[1]].node = e} preload="auto"
                        />,
                        replayCount: -1
                    };
                    return this.questionSounds[path[1]].react;
                }
            });
            let count = this.questionSounds.reduce((p,c)=>c?p+1:p,this.introductionSound.react?1:0);
            if(constr) this.state.totalSounds = count; else this.setState({ totalSounds : count });
            return true;
        }else
            return false;
    }
    getAssessment(id){
        return Storage.getItem('id'+(id || this.props.params.assessmentId));
    }
    getSounds(o,prefix){
        prefix = prefix || '';
        return Object.keys(o).reduce((p,c)=>{
            if(prefix == 'AssessmentQuestions.' && parseInt(c) > this.assessment.NumberOfQuestions) return p;
            if(!o[c]) return p;
            if(typeof o[c] == 'object') return p.concat(this.getSounds(o[c],prefix+c+'.'));
            if(typeof o[c] == 'string' && o[c].match(/sounds\/.+\.[mp3og]{3}$/ig)) p.push({ [prefix+c] : o[c]});
            return p;
        },[]);
    }
    // preloadAllSounds(o){
    //     let sounds = this.getSounds(o);
    //     this.setState({ totalSounds : sounds.length });
    //     sounds.forEach(snd => {
    //         let s = new Audio();
    //         s.onloadeddata = () => this.setState({ loadedSounds : ++this.state.loadedSounds });
    //         s.appendChild(document.createElement('source')).src = "https://doitcdn.azureedge.net/shared/" + snd;
    //         s.appendChild(document.createElement('source')).src = "https://doitcdn.azureedge.net/shared/" + snd.replace('mp3', 'ogg');
    //         console.log(s);
    //     });
    // }
    getImages(o,prefix){
        prefix = prefix || '';
        return Object.keys(o).reduce((p,c)=>{
            if(prefix == 'AssessmentQuestions.' && parseInt(c) > this.assessment.NumberOfQuestions) return p;
            if(!o[c]) return p;
            if(typeof o[c] == 'object') return p.concat(this.getImages(o[c],prefix+c+'.'));
            if(typeof o[c] == 'string' && o[c].match(/images\/[^.]+\.[pngje]{3,4}/ig)) p.push(o[c]);
            return p;
        },[]);
    }
    preloadAllImages(){
        let images = this.getImages(this.assessment);
        this.setState({ totalImages : images.length });
        images.forEach(img => {
            let i = new Image();
            i.onload = () => this.setState({ loadedImages : ++this.state.loadedImages });
            i.src = "https://doitcdn.azureedge.net/shared/"+img;
        });
    }
    componentDidMount(){
        document.body.style.backgroundColor = '#ffffff';
        this.preloadAllImages();
    }
    componentWillUnmount(){
        document.body.style.backgroundColor = null;
    }
    stripAssessmentData(){
        return Object.assign({},this.assessment,{ AssessmentQuestions : undefined });
    }
    handleQuestionSubmit(data){
        // TODO: aomething with the data :)
        this.goToNextQuestion();
    }
    goToNextQuestion(){
        this.setState({ question : this.state.question + 1 });
    }
    replaySound(){
        this.setState({replaySound:true});
    }

    render() {
        console.log(this.assessment);
        if(!this.assessment){
            this.interval = setInterval(()=>(this.init()?this.forceUpdate():null),128);
            return <Spinner/>;
        }
        if(this.interval){
            clearInterval(this.interval);
            this.interval = null;
        }
        let imagesProgress = (this.state.loadedImages / this.state.totalImages) * 100;
        let audioProgress = this.questionSounds.reduce((p,a) => (a && a.node ? (p.p=p.p+a.node.getProgress(),++p.l,p) : p), {p:0,l:0});
        audioProgress = this.state.loadedSounds == this.state.totalSounds ? 100 : (audioProgress.p / audioProgress.l)*100 || 0;
        //console.log("ap = %o, ip = %o",audioProgress,imagesProgress);
        let imagesColor = imagesProgress < .2 ? '#BFAF4A' : imagesProgress < .5 ? '#DFCE5E' : imagesProgress < .8 ? '#EFDE5B' : null;
        let audioColor = audioProgress < .2 ? '#00628E' : audioProgress < .5 ? '#0078AE' : audioProgress < .8 ? '#0087BE' : null;
        return <div>
            <div className="container main">
                <link rel="stylesheet" href="/Content/other/assessment-v4.css" />
                <header>
                    <div className="row">
                        <Progress question={this.state.question} totalQuestions={this.assessment.NumberOfQuestions} />
                        <Menu soundOn={this.state.soundOn} canMute={this.assessment.AllowMute} canReplay={this.assessment.SoundReplay} replaySound={this.replaySound.bind(this)} />
                    </div>
                    <div id="Sounds" style={{display:'hidden'}}>
                        {!this.state.question ? this.introductionSound.react : null}
                        {this.sounds}
                    </div>
                </header>
                <div id="body">
                    <div styleName="loadingProgressDiv">
                        <div styleName="loadingImages"
                             className={imagesProgress && imagesProgress < 100 ? "loading" : imagesProgress >= 99.9 ? "finished" : ""}
                             style={{ width : imagesProgress+'%', backgroundColor : imagesColor }} />
                        <div styleName="loadingSounds"
                             className={audioProgress && audioProgress < 100 ? "loading" : audioProgress >= 99.9 ? "finished" : ""}
                             style={{ width : audioProgress+'%', backgroundColor : audioColor }} />
                    </div>
                    {/*<div style={{color:this.state.loadedImages==this.state.totalImages?"green":"red"}}>{this.state.loadedImages} / {this.state.totalImages}</div>*/}
                    {/*<div style={{color:this.state.loadedSounds==this.state.totalSounds?"green":"red"}}>{this.state.loadedSounds} / {this.state.totalSounds}</div>*/}
                    {this.state.question
                        ? this.state.question <= this.assessment.NumberOfQuestions
                            ? <Question
                                question={this.assessment.AssessmentQuestions[this.state.question-1]}
                                next={this.handleQuestionSubmit.bind(this)}
                                lastQuestion={this.state.question == this.assessment.NumberOfQuestions}
                                assessment={this.stripAssessmentData(this.assessment)}
                                debugMode={this.state.debug}
                                audio={this.questionSounds[this.state.question-1]?this.questionSounds[this.state.question-1].react:null}
                            />
                            : <h2 style={{color:'red',width:'100%',textAlign:'center'}}>Finished</h2>
                        : <Introduction
                            intro={this.assessment.IntroductionText}
                            start={this.goToNextQuestion.bind(this)}
                            canStart={this.state.loadedImages>=this.state.totalImages&&this.state.loadedSounds>=this.state.totalSounds}
                          />}
                </div>
                <footer>
                    <section className="clearfix">
                        <span id="lblTest" style={{fontWeight:'bold'}}>{this.assessment.Title.replace(/\s?\([^)]+\)/,'')}</span>
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
    accessabilityOptions() {
        let id = "AccessibilityOptionsWindow";
        let getContent;
        let themeChange = c => {
            this.props.actions.changeTheme(c);
            this.props.actions.updateWindow(
                id,
                this.props.locale.getLocaleString("AccessibilityOptions"),
                getContent(),
                undefined,
                {style: {maxWidth: 555}}
            );
        };
        let dangerousHTML = {
            __html: this.props.locale.getLocaleString("AccessibilityOptions_AdjuctingTextSize_Info")
                .replace(/CTRL/g, navigator.platform.toString().indexOf("Mac") > -1 ? "Command" : "Ctrl")
        };
        let colors = ["default", "white", "pastelorange", "pastelturquoise", "pastelpurple", "pastelgreen", "pastelblue", "blue", "hivis", "blackyellow", "yellowblack"];
        getContent = () => {
            let buttons = colors.map((c, i) => <label onClick={themeChange.bind(this, c)} key={i}
                                                      className={"btn btn-default btn-lg theme-" + c + (this.props.appState.theme == c ? " active" : "")}>
                <input type="radio" name="options" defaultChecked={this.props.appState.theme == c}/> A<span
                className="sr-only"> - switch to {c} theme</span>
            </label>);
            return <span>
            <h3>{this.props.locale.getLocaleString("AccessibilityOptions_Colour")}</h3>
            <div id="themes" style={{textAlign: 'center'}}>
                <div className="btn-group" data-toggle="buttons">
                    {buttons}
                </div>
                <div className="clear-fix"></div>
            </div>
            <h3>{this.props.locale.getLocaleString("AccessibilityOptions_AdjustingTextSize")}</h3>
            <span dangerouslySetInnerHTML={dangerousHTML}/>
        </span>;
        };
        this.props.actions.openWindow(
            id,
            this.props.locale.getLocaleString("AccessibilityOptions"),
            getContent(),
            undefined,
            {style: {maxWidth: 555}}
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
                <li className={this.props.canReplay?"":'hidden'}><a data-toggle="tooltip" data-placement="bottom" title="Replay Sound" onClick={this.props.replaySound}><i className="fa fa-undo fa-2x" /></a></li>
                <li className={this.props.canMute&&!this.props.soundOn?"":'hidden'}><a data-toggle="tooltip" data-placement="bottom" title="Turn Sound On"><i className="fa fa-volume-off fa-2x" /></a></li>
                <li className={this.props.canMute&&this.props.soundOn?"":'hidden'}><a data-toggle="tooltip" data-placement="bottom" title="Turn Sound Off"><i className="fa fa-volume-up fa-2x" /></a></li>
                <li>
                    <a data-toggle="tooltip" data-placement="bottom" title="Exit" onClick={hashHistory.goBack}><i className="fa fa-sign-out fa-2x" /></a>
                </li>
            </ul>
        </div>;
    }
}