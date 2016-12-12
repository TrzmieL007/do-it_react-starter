/**
 * Created by trzmiel007 on 09/12/16.
 */
import React from 'react';
import common from '../../../Utils/commonActions';
import Audio from '../../Components/audio';

class Question extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            answeringEnabled: true,
            timerStarted: false,
            timerElapsed: false,
            seeQuestion: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.init(props,1);
    }
    componentWillReceiveProps(newProps){
        if(!common.compareObj(this.props.question, newProps.question)){
            this.init(newProps);
        }
    }
    init(props,constructor){
        this.question = props.question;
        this.assessment = props.assessment;
        this._disableUntilSoundFinish = this.question.DisableUntilSoundFinish != null ? this.question.DisableUntilSoundFinish : this.assessment.DisableUntilSoundFinish;
        if(this._disableUntilSoundFinish) this.state.answeringEnabled = false;
        this.state.timerStarted = false;
        this.state.timerElapsed = false;
        this.state.seeQuestion = false;
        if(!constructor) this.setState(this.state);
        this.replayCount = 0;
        this.startedOn = null;
    }
    render(){
        let audio = this.question.QuestionSound ? <Audio src={common.getSourceURL()+this.question.QuestionSound} autoplay={!!this.question.SoundAuto} onEnded={()=>{
            if(this._disableUntilSoundFinish) this.setState({ answeringEnabled: true });
        }} hidden={!this.question.ShowPlaySoundButton} /> : null;
        let questionPanelHeight = (this.question.QuestionPanelHeight > 0 ? this.question.QuestionPanelHeight : this.assessment.QuestionPanelHeight);
        let questionImageLayout = (this.question.QuestionImageLayout > 0 ? this.question.QuestionImageLayout : this.assessment.QuestionImageLayout);

        let answerType = (this.question.Type > 0 ? this.question.Type : this.assessment.Type);
        let answer;
        switch (answerType) {
            case 1:
                answer = <MultipleChoice
                    question={this.question}
                    assessment={this.assessment}
                    onSubmit={this.handleSubmit}
                    answeringEnabled={this.state.answeringEnabled}
                    debugMode={this.props.debugMode}
                />;
                break;
            case 2:
            case 3:
            case 14:
                answer = <TextEntry
                    question={this.question}
                    onSubmit={this.handleSubmit}
                    answeringEnabled={this.state.answeringEnabled}
                    timerElapsed={this.state.timerElapsed}
                    onKeyPress={this.handleTimerStart}
                />;
                break;
            case 4:
                answer = <HotSpots
                    question={this.question}
                    onSubmit={this.handleSubmit}
                    answeringEnabled={this.state.answeringEnabled }
                />;
                questionImageLayout = -1; //Hide standard image location
                break;
            case 6:
            case 11:
                answer = <MultipleChoiceRadio
                    question={this.question}
                    onSubmit={this.handleSubmit}
                    answeringEnabled={this.state.answeringEnabled}
                    debugMode={this.props.debugMode}
                />;
                break;
            case 16:
                answer = <Instructions
                    onSubmit={this.handleSubmit}
                    debugMode={this.props.debugMode}
                />;
                break;
            default:
                answer = <MultipleChoiceRadio
                    question={this.question}
                    onSubmit={this.handleSubmit}
                    answeringEnabled={this.state.answeringEnabled}
                    debugMode={this.props.debugMode}
                />;
                break;
        }
        let timer;
        if(this.question.TimerEnabled){
            timer = <span>Timer</span>;
        }
        let questionText2 = '';
        let questionText2Before = '';
        let questionText2BeforeQuestion = false;
        if(this.question.QuestionText2 !== ''){
            questionText2BeforeQuestion = (this.question.QuestionText2BeforeQuestion != null ? this.question.QuestionText2BeforeQuestion : this.assessment.QuestionText2BeforeQuestion);
            if(questionText2BeforeQuestion) {
                if($.inArray(this.props.question.AssessmentQuestionId, app.result.questionsSeen) != -1) {
                    questionText2BeforeQuestion = false;
                } else if (!this.state.seeQuestion) {
                    questionText2Before =   <div className="assessmentQuestionText2Before">
                        <span dangerouslySetInnerHTML={{__html:this.props.question.QuestionText2}} />
                        <div className="row" style={{ marginTop: 20 }}>
                            <div className="col-sm-3" />
                            <div className="col-sm-offset-6 col-sm-3">
                                <button className="btn btn-primary btn-lg btn-block next-button" onClick={this.handleSeeQuestion }>{app.locale.TakeTest_QuestionText2_SeeQuestion}</button>
                            </div>
                        </div>
                    </div>;
                }
            } else {
                questionText2 = <div className="assessmentQuestionText2 panel panel-default">
                    <span dangerouslySetInnerHTML={{__html:this.props.question.QuestionText2}} />
                </div>;
            }
        }
        if(this.startedOn == null) this.startedOn = new Date();
        return <div className="wrapcenter assessmentQuestion">
            <div className="center-nomargins">
                {questionText2Before}
                <div className={'assessmentQuestion row ' + ((!questionText2BeforeQuestion || this.state.seeQuestion) ? '' : 'hidden')}>
                    <div id="panTallQuestionImageLeft" className={(questionImageLayout == 2 && this.question.ImageFile != '') ? 'col-md-5 tallQuestionImageLeft' : 'hidden'}>
                        <img id="imgTallQuestionImageLeft" className="tallQuestionImage" src={(questionImageLayout === 2 && this.question.ImageFile != '') ? common.getSourceURL() + this.question.ImageFile : ''} />
                    </div>
                    <div className={((questionImageLayout == 2 || questionImageLayout == 3) && this.question.ImageFile != '') ? 'col-md-7' : 'col-md-12'}>
                        <div className={'assessmentQuestionPanel questionPanelHeight-' + questionPanelHeight}>
                            <div style={{ textAlign: 'center' }} className={(questionImageLayout == 6 && this.question.ImageFile != '') ? '' : 'hidden'}>
                                    <span style={{ minHeight: 250, marginTop: 10, display: 'inline-block' }}>
                                        <span className="thumbnail">
                                            <img id="imgQuestionImage" src={(questionImageLayout == 6 && this.question.ImageFile != '') ? common.getSourceURL() + this.question.ImageFile : ''} />
                                        </span>
                                    </span>
                            </div>
                            {questionText2}
                            <div className="assessmentQuestionText">
                                {audio}
                                <span dangerouslySetInnerHTML={{__html:this.props.question.QuestionText}} />
                            </div>
                            <div style={{ textAlign: 'center' }} className={((questionImageLayout == 0 || questionImageLayout == 1) && this.question.ImageFile != '') ? '' : 'hidden'}>
                                    <span style={{ minHeight: 250, marginTop: 10, display: 'inline-block' }}>
                                        <span className="thumbnail">
                                            <img id="imgQuestionImage" src={((questionImageLayout == 0 || questionImageLayout == 1) && this.question.ImageFile != '') ? common.getSourceURL() + this.question.ImageFile : ''} />
                                        </span>
                                    </span>
                            </div>
                        </div>
                        <div id="answersPanel" style={{margin: '0 auto'}}>
                            {answer}
                        </div>
                        {timer}
                    </div>
                    <div id="panTallQuestionImageRight" className={(questionImageLayout == 3 && this.question.ImageFile != '') ? 'col-md-5 tallQuestionImageRight' : 'hidden'}>
                        <img id="imgTallQuestionImageRight" className="tallQuestionImage" src={(questionImageLayout == 3 && this.question.ImageFile != '') ? common.getSourceURL() + this.question.ImageFile : ''} />
                    </div>
                </div>
            </div>
        </div>;
    }
    handleSubmit(answer, answerId, score, event, attributes) {
        let completedOn = new Date();
        this.props.next({
            questionId: this.props.question.AssessmentQuestionId,
            questionNumber: this.props.question.QuestionNumber,
            answer: answer,
            answerId: answerId,
            score: score,
            startedOn: this.startedOn.toISOString(),
            completedOn: completedOn.toISOString(),
            duration: ((completedOn - this.startedOn) / 1000),
            replayCount: this.replayCount,
            soundStatus: this.props.soundStatus,
            confidenceValue: 0,
            attributes: attributes
        });
    }
}


Question.propTypes = {
    assessment: React.PropTypes.object,
    question: React.PropTypes.object,
    next: React.PropTypes.func,
    lastQuestion: React.PropTypes.bool,
    debugMode: React.PropTypes.bool
};

/* Uncoment if using scss styles together with the class */
//import scss from './question.scss';
//import CSSModules from 'react-css-modules';
/** Uncoment this line for use with import keyword **/
//export default CSSModules(Question,scss);
/** Uncoment this line for use with require(...) function **/
//module.exports = CSSModules(Question,scss);

/* Uncoment this line for use with import keyword */
export default Question;
/* Uncoment this line for use with require(...) function */
// module.exports = Question;

class MultipleChoice extends React.Component {
    constructor(props){
        super(props);
        this.handleKeydown = this.handleKeydown.bind(this);
    }
    componentWillMount(){ document.addEventListener("keydown", this.handleKeydown, false); }
    componentWillUnmount(){ document.removeEventListener("keydown", this.handleKeydown, false); }
    handleAnswerSubmit(answer, answerId, score, e){ this.props.onSubmit(answer, answerId, score, e); }
    handleKeydown(e){
        let number = (e.keyCode >= 49 && e.keyCode <= 57) ? e.keyCode - 48 : (e.keyCode >= 97 && e.keyCode <= 105) ? e.keyCode - 96 : 0;
        if(number){
            let matchingAnswer = 0;
            if(this.props.question.AssessmentQuestionAnswers/*Answers*/ && this.props.question.AssessmentQuestionAnswers/*Answers*/.some(x => (matchingAnswer = x,x.Id == number)))
                this.handleAnswerSubmit(matchingAnswer./*AnswerText*/Text, matchingAnswer.Id, matchingAnswer.Score);
        }
    }

    // render(){ return <div>{this.constructor.name}</div>}
    render(){
        let question = this.props.question;
        let assessment = this.props.assessment;
        let answerTextAlignment = question.AnswerTextAlignment || assessment.AnswerTextAlignment;
        let answerTextSize = question.AnswerTextSize || assessment.AnswerTextSize;
        let boxedAnswerHeight = question.BoxedAnswerHeight || assessment.BoxedAnswerHeight;
        let boxedAnswerWidth = question.BoxedAnswerWidth || assessment.BoxedAnswerWidth;

        return (
            <div id="multipleChoice" className="answerPanelBoxedListQuestion2-v3">
                <ul className="answers">
                    {this.props.question./*Answers*/AssessmentQuestionAnswers.map(answer =>
                        <MultipleChoiceAnswer key={answer.Id} answer={answer}
                                                  answeringEnabled={this.props.answeringEnabled}
                                                  answerTextAlignment={answerTextAlignment}
                                                  answerTextSize={answerTextSize}
                                                  boxedAnswerHeight={boxedAnswerHeight}
                                                  boxedAnswerWidth={boxedAnswerWidth}
                                                  debugMode={this.props.debugMode}
                                                  onClick={this.handleAnswerSubmit.bind(this)}
                                                  assessment={assessment}
                                                  question={this.props.question}
                        />
                    )}
                </ul>
            </div>
        );
    }
}
class MultipleChoiceAnswer extends React.Component {
    constructor(props){ super(props); }
    // render(){ return <div>{this.constructor.name}</div>}
    render() {
        let answerStyle = {};
        if (this.props.answer.ImageFile) {
            answerStyle = {
                backgroundImage: 'url(\'' + common.getSourceURL() + this.props.answer.ImageFile + '\')',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'Transparent',
                cursor: 'pointer',
                backgroundPosition: 'center center'
            };
        }
        answerStyle.height = this.props.height;
        let answerText = this.props.answer.Text;
        let extraCssClass = this.props.question["Answer"+this.props.answer.Id+"CssClass"] || this.props.assessment["Answer"+this.props.answer.Id+"CssClass"];
        if(answerText == "✔") {
            extraCssClass += "answer-success fa fa-check ";
            answerText = "";
        }
        else if (answerText == "✗") {
            extraCssClass += "answer-danger fa fa-remove ";
            answerText = "";
        }
        let debugInfo = this.props.debugMode ? debugInfo = <span className="debug-info badge badge-info">{this.props.answer.Score}</span> : null;
        return (
            <li id={'answerLi' + this.props.answer.Id} className={'answerTextAlignment-' + this.props.answerTextAlignment + ' answerTextSize-' + this.props.answerTextSize + ' boxedAnswerHeight-' + this.props.boxedAnswerHeight + ' boxedAnswerWidth-' + this.props.boxedAnswerWidth + ' mainSoundEnable ' + (this.props.answer.CssClass || '') + extraCssClass + (this.props.answeringEnabled ? '' : ' disabled') }>
                <div ref={(c) => this._button = c} id={'answer' + this.props.answer.Id} accessKey={this.props.answer.Id} onClick={this._onClick.bind(this)} tabIndex="1" role="button" className={extraCssClass} style={answerStyle} onKeyDown={this._onKeyDown.bind(this)}>
                    <span>{answerText}</span>
                </div>
                {debugInfo}
                <kbd data-toggle="tooltip" data-placement="bottom" title={'Use shortcut key [' + this.props.answer.Id + '] to select this answer' }>{this.props.answer.Id}</kbd>
            </li>
        );
    }
    _onClick() {
        this.props.onClick(this.props.answer.Text, this.props.answer.Id, this.props.answer.Score);
        this._button.blur();
    };
    _onKeyDown(e) {
        if (e.keyCode == 13 || e.keyCode == 32) {
            this._onClick();
        }
    }
}




class TextEntry extends React.Component {
    constructor(props){ super(props); }
    render(){ return <div>{this.constructor.name}</div>}
}
class HotSpots extends React.Component {
    constructor(props){ super(props); }
    render(){ return <div>{this.constructor.name}</div>}
}
class MultipleChoiceRadio extends React.Component {
    constructor(props){ super(props); }
    render(){ return <div>{this.constructor.name}</div>}
}
class Instructions extends React.Component {
    constructor(props){ super(props); }
    render(){ return <div>{this.constructor.name}</div>}
}