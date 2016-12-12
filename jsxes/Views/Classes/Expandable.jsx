import React from 'react';
import styles from '../Components/expandableMenu.scss';

class Expandable extends React.Component {
    constructor(props) {
        super(props);
        this.state = { opened : null };
        this.closingLisener = this.closingLisener.bind(this);
        this.down = true;
        this.toggleExpansion = this.toggleExpansion.bind(this);
    }

    render() {
        let dirClass;
        switch(this.props.expandDir){
            case "up":
            case "dropup":
                dirClass = "dropup";
                this.down = false;
                break;
            case "down":
            case "dropdown":
            default:
                dirClass = "dropdown";
                break;
        }
        let icon = this.props.icon;
        return this.generateDropdown(icon,dirClass);
    }

    /** To be overwritten. Function to generate the whole content.<br/>
     * To place the <code>ul</code> element into the view, use <code>this.getUl()</code> method.
     * @param icon
     * @param dirClass
     * @returns {XML}
     */
    generateDropdown(icon,dirClass){
        return <div className={styles.expandableMenu+" btn-group "+dirClass+(this.state.opened ? " open" : '')}>
            <button type="button" className="btn btn-default dropdown-toggle"
                    onClick={this.toggleExpansion}>
                {icon ? <i className={icon}/> : null} {this.props.text} <span className="caret"/>
            </button>
            {this.getUl()}
        </div>
    }

    /** To be overwrien. That's a function for Array.prototype.map callback function.
     * @param e
     * @param i
     * @returns {XML}
     */
    mapElements(e,i) {
        if(typeof e == 'object'){
            return <li key={e.id}>{e.link ? e.name : <a onClick={() => {
                e.callback();
                this.close();
            }}>{e.name}</a>}</li>
        }
        if(typeof e == 'string' && e.match(/(divider)|(separator)/i)) return <li className="divider" key={i}/>;
    }
    /** To be overwrien. */
    getTop(){ return -6; }
    /** To be overwrien. */
    getBottom(){ return -4; }

    getUl(){
        return <ul className={"dropdown-menu"+(this.props.position == "right" ? " dropdown-menu-right" : '')}
            ref={e => {
                if(!e || this.menuHeight) return;
                e.style.display = 'block';
                e.style.transition = "none";
                this.menuHeight = (e.clientHeight*(-1)+(this.down ? this.getBottom() : this.getTop()))+'px';
                e.style.transition = null;
                e.style.display = 'none';
                e.style.padding = 0;
                this.down ? e.style.bottom = this.getBottom()+'px' : e.style.top = this.getTop()+'px';
                this.menuUl = e;
            }}>
            {this.props.data.map(this.mapElements,this)}
            <span className="clear-fix" />
        </ul>
    }

    toggleExpansion(){
        this.state.opened ? this.close() : this.open();
    }

    open(){
        this.setState({ opened : true });
        this.menuUl.style.display = 'block';
        this.menuUl.style.opacity = 1;
        setTimeout(()=>{
            this.menuUl.style.padding=null;
            this.down ? this.menuUl.style.bottom=this.menuHeight : this.menuUl.style.top=this.menuHeight;
        },8);
        document.body.addEventListener('click',this.closingLisener);
    }
    close(){
        this.setState({ opened : false });
        (this.down ? this.menuUl.style.bottom = this.getBottom()+'px' : this.menuUl.style.top = this.getTop()+'px');
        this.menuUl.style.padding = 0;
        setTimeout(()=>(this.menuUl.style.opacity=0,setTimeout(()=>this.menuUl.style.display='none',256)),512);
        document.body.removeEventListener('click',this.closingLisener);
    }

    closingLisener(e){
        if(e.toElement.tagName.toLowerCase() == 'a'
            && e.toElement.parentNode.tagName.toLowerCase() == 'li'
            && e.toElement.parentNode.parentNode.classList.contains('dropdown-menu'))
            return;
        e.stopPropagation ? e.stopPropagation() : null;
        this.close();
    }
}

Expandable.propTypes = {
    data : React.PropTypes.arrayOf(React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.shape({
            name : React.PropTypes.node.isRequired,
            id : React.PropTypes.node.isRequired,
            callback : React.PropTypes.func
        })
    ])).isRequired,
    expandDir : React.PropTypes.string,
    position : React.PropTypes.string,
    icon : React.PropTypes.string,
    text : React.PropTypes.string,
    aAsButton : React.PropTypes.bool
};

export default Expandable;