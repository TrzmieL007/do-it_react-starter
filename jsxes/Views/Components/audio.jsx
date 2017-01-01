/**
 * Created by trzmiel007 on 01/12/16.
 */
import React from 'react';

class Audio extends React.Component {
    constructor(props) {
        super(props);
        this.state = { playing : false, loading : 0 };
        this.audioEvent = this.audioEvent.bind(this);
        this.playAudio = this.playAudio.bind(this);
        this.loadingProgress = this.loadingProgress.bind(this);
    }
    componentWillReceiveProps(newProps){
        if(newProps.playNow && this.audio) this.audio.play();
        else if(newProps.src !== this.props.src){
            this.audio.pause();
            clearTimeout(this.removeTimeout);
            this.removeLoader();
        }
    }
    componentDidUpdate(prevProps){
        if(prevProps.src != this.props.src && this.audio){
            this.setState({ loading : 0 });
            setTimeout(()=>this.audio.load(),1);
        }
    }
    componentWillUnmount(){
        this.audio.pause();
    }

    render(){
        let mp3 = this.props.src.replace(/\.[mp3og]{3}$/,".mp3");
        let ogg = this.props.src.replace(/\.[mp3og]{3}$/,".ogg");
        return (<span>
            <audio ref={a => this.audio = a}
                   onLoadStart={this.props.onLoadstart}
                   onLoadedData={this.loadingProgress}
                   onCanPlayThrough={this.props.autoplay ? ()=>{this.audio.play();this.props.onCanPlayThrough()} : this.props.onCanPlayThrough}
                   onPlay={this.audioEvent}
                   onProgress={this.loadingProgress}
                   onPause={this.audioEvent}
                   onEnded={this.props.onEnded}
                   preload={this.props.preload || "auto"}
            >
                <source src={mp3} type="audio/mpeg"/>
                <source src={ogg} type="audio/ogg"/>
            </audio>
            {this.props.hidden
                ? this.state.loading > -1
                    ? <div className={this.state.loading > 99.9 ? "loaded" : ''} styleName="loadingProgress" style={{
                        width : this.state.loading+"%",
                        backgroundColor : this.state.loading < 20 ? '#005B83' : this.state.loading < 50 ? '#00719C' : this.state.loading < 80 ? '#007DB5' : null
                      }} />
                    : null
                : <span title="Hear text aloud" styleName={"sm2_button"+(this.state.playing?" sm2_playing":"")} onClick={this.playAudio}>
                {this.state.loading > -1
                    ? (document.implementation.hasFeature("http://www.w3.org/2000/svg")
                        ? <svg>
                            <circle
                                className={this.state.loading > 99.9 ? "loaded" : ""}
                                r="14"
                                cx="50%"
                                cy="50%"
                                transform="rotate(-90, 18, 18)"
                                strokeDasharray={"0,0,"+((this.state.loading/100)*Math.PI*2*14)+','+(Math.PI*2*14)}
                            />
                        </svg>
                        : <div className={"progress"+(this.state.loading > 99.9 ? " loaded" : "")} style={{width:this.state.loading+'%'}} />)
                    : null}
                </span>}
        </span>);
    }
    getProgress(){
        let rng = [];
        for(let i = 0; i < this.audio.buffered.length; ++i) rng.push([this.audio.buffered.start(i),this.audio.buffered.end(i)]);
        return rng.reduce((p,e) => p += e[1] - e[0],0) / this.audio.duration;
    }
    loadingProgress(ev){
        let rng = [];
        for(let i = 0; i < this.audio.buffered.length; ++i) rng.push([this.audio.buffered.start(i),this.audio.buffered.end(i)]);
        let loaded = rng.reduce((p,e) => p += e[1] - e[0],0);
        if(this.props.onProgress) this.props.onProgress(loaded,this.audio.duration);
        else this.setState({ loading : (loaded*100)/this.audio.duration });
        if(ev.nativeEvent.type == 'loadeddata'){
            if(this.props.onLoaded) this.props.onLoaded();
            if(this.state < 100) this.setState({ loading : 100 });
            this.removeTimeout = setTimeout(this.removeLoader.bind(this),2048);
            // if(this.props.autoplay) this.audio.play();
        }
        console.log('loaded progress %o',loaded);
    }
    removeLoader(){
        if(!this.audio) return;
        this.setState({ loading : -1 });
    }

    audioEvent(ev){
        switch(ev.nativeEvent.type){
            case "play":
                if(this.props.onPlay) this.props.onPlay();
                return this.setState({ playing : true });
            case "pause":
                if(this.props.onPause) this.props.onPause();
                return this.setState({ playing : false });
            default: return;
        }
    }

    playAudio(){
        this.state.playing ? this.audio.pause() : this.audio.play();
    }
}

Audio.propTypes = {
    src: React.PropTypes.string.isRequired,
    onPlay: React.PropTypes.func,
    onPause: React.PropTypes.func,
    onProgress: React.PropTypes.func,
    onLoadstart: React.PropTypes.func,
    onEnded: React.PropTypes.func,
    onCanPlayThrough: React.PropTypes.func,
    onLoaded: React.PropTypes.func,
    preload: React.PropTypes.string,
    autoplay: React.PropTypes.bool,
    hidden : React.PropTypes.bool
};

import scss from './audio.scss';
import CSSModules from 'react-css-modules';
export default CSSModules(Audio, scss, { allowMultiple : true });