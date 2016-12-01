/**
 * Created by trzmiel007 on 01/12/16.
 */
import React from 'react';

class Audio extends React.Component {
    constructor(props) {
        super(props);
        this.state = { playing : false };
        this.audioEvent = this.audioEvent.bind(this);
        this.playAudio = this.playAudio.bind(this);
    }

    render() {
        let mp3 = this.props.src.replace(/.(\.[mp3og]{3}$)/,".mp3");
        let ogg = this.props.src.replace(/.(\.[mp3og]{3}$)/,".ogg");
        return (<span>
            <audio ref={a => this.audio = a} onPlay={this.audioEvent} onPause={this.audioEvent}>
                <source src={mp3} type="audio/mpeg"/>
                <source src={ogg} type="audio/ogg"/>
            </audio>
            <span title="Hear text aloud" className={"sm2_button"+(this.state.playing?" sm2_playing":"")} onClick={this.playAudio} />
        </span>);
    }

    audioEvent(ev){
        switch(ev.nativeEvent.type){
            case "play":
                return this.setState({ playing : true });
            case "pause":
                return this.setState({ playing : false });
            default: return;
        }
    }

    playAudio(){
        this.state.playing ? this.audio.pause() : this.audio.play();
    }
}

Audio.propTypes = {
    src: React.PropTypes.string.isRequired
};

export default Audio;