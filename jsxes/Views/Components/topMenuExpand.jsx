/**
 * Created by trzmiel007 on 06/12/16.
 */
import React from 'react';
import Expandable from '../Classes/Expandable';

class TopMenuExpand extends Expandable {
    constructor(props) {
        super(props);
    }
    generateDropdown(icon,dirClass){
        return <li styleName="expandableMenuLink" className={dirClass+(this.state.opened ? " open" : '')}>
                <a className="dropdown-toggle"
                   onClick={this.toggleExpansion}>
                    {icon ? <i className={icon}/> : null} {this.props.text} <span className="caret"/>
                </a>
            {this.getUl()}
            </li>;
    }
    mapElements(e,i){
        if(typeof e == 'object') return <li key={e.id} onClick={this.toggleExpansion}>{e.name}</li>;
        if(typeof e == 'string' && e.match(/(divider)|(separator)/i)) return <li className="divider" key={i} />;
    }
    getTop(){ return -4; }
    getBottom(){ return -2; }
}

/* Uncoment if using scss styles together with the class */
import scss from './expandableMenu.scss';
import CSSModules from 'react-css-modules';
/** Uncoment this line for use with import keyword **/
export default CSSModules(TopMenuExpand,scss);