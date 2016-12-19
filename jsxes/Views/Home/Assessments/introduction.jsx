/**
 * Created by trzmiel007 on 09/12/16.
 */
import React from 'react';
// import Audio from '../../Components/audio';
// import common from '../../../Utils/commonActions';

class Introduction extends React.Component {
    render(){
        //let audio = this.props.audio ? <Audio src={common.getSourceURL()+this.props.audio} autoplay={this.props.autoplay} hidden={!this.props.audioButton} playNow={this.props.replaySound} /> : null;
        return <div className="wrapcenter assessmentQuestion">
            <div className="center-nomargins">
                <div>
                    <div style={{minHeight:250}}>
                        {/*this.props.audio*/}
                        <span style={{fontSize:"X-Large"}} dangerouslySetInnerHTML={{__html:this.props.intro}} />
                    </div>
                    <div className="row">
                        <div className="col-sm-push-7 col-sm-5 col-md-push-8 col-md-4 col-lg-push-9 col-lg-3">
                            <input type="button" id="btnStartTest" value="Start" className={"btn btn-primary btn-lg btn-block"+(this.props.canStart?'':' disabled')} onClick={this.props.canStart?this.props.start:null} />
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }
}

Introduction.propTypes = {
    intro : React.PropTypes.string.isRequired,
    start : React.PropTypes.func.isRequired,
    canStart : React.PropTypes.bool.isRequired/*,
    audio : React.PropTypes.element,
    autoplay : React.PropTypes.bool,
    audioButton : React.PropTypes.bool*/
};

export default Introduction;
