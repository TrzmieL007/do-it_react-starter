import React from 'react';
import Navigation from '../../NavigationTree';
import Link from 'react-router/lib/Link';
import style from '../../ScssStyles/general.scss';
import common from '../../Utils/commonActions';
import ExpandableMenu from '../Components/expandableMenu';
import TopMenuExpand from '../Components/topMenuExpand';

import Reactify from '../../Utils/reactify';

class Index extends React.Component {
    constructor(props){
        super(props);
        let linkCreator = (p,v,i) => {
            if(v.hasOwnProperty('dropdown') && v.elems){
                p.push(<TopMenuExpand key={i} data={v.elems.map((d,id)=>({
                    id,
                    name : <Link to={d.path} activeClassName="active" {...d.props}
                                 onClick={typeof d.callback == 'function' ? d.callback.bind(props) : null}>
                        <i className={d.icon}/> {d.title}
                    </Link>,
                    link : true
                }))} {...v.props} aAsButton={true} />);
            }else{
                p.push(<li key={i} className={v.side ? "visible-xs" : "visible-md visible-lg"}>
                    <Link to={v.path} activeClassName="active" {...v.props}
                          onClick={typeof v.callback == 'function' ? v.callback.bind(props) : null}>
                        <i className={v.icon}/> {v.title}
                    </Link>
                </li>, <li key={i + 'sm'} className={v.side ? "hidden-xs" : "visible-sm"}>
                    <Link to={v.path} activeClassName="active" {...v.props} aria-label={v.title || v.alt}
                          data-original-title={v.title || v.alt}
                          onClick={typeof v.callback == 'function' ? v.callback.bind(props) : null}>
                        <i className={v.icon}/>
                    </Link>
                </li>);
            }
            return p;
        };
        this.mainLinks = Navigation.getMenu(props.route.path,'main').reduce(linkCreator,[]);
        this.sideLinks = Navigation.getMenu(props.route.path,'side').reduce(linkCreator,[]);
        this.client = common.getClientData();
    }
    render(){
        let useInfo = this.props.appState.user ? "Logged in as "+this.props.appState.user.name+" ("+this.props.appState.user.email+")" : "?? Not logged in ??";
        let clientName = this.props.appState.client.name+" ("+this.props.appState.client.clientCode+")";
        return (
            <div className={style.GeneralContent}>
                <header className="navbar navbar-inverse navbar-static-top frontend-nav primary-colour-bg" role="banner">
                    <div className="container">
                        <div className="navbar-header">
                            <button className="navbar-toggle" type="button" data-toggle="collapse" data-target=".bs-navbar-collapse">
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar" />
                                <span className="icon-bar" />
                                <span className="icon-bar" />
                            </button>
                            <a className="navbar-brand" href="/">
                                <img width="81" height="21" className="logo hidden-xs" src="/images/logo-doit.svg" aria-label="&quot;Do-IT" />
                                <img width="21" height="21" className="logo-xs visible-xs" src="/images/logo-doit_xs.svg" aria-label="&quot;Do-IT" />
                            </a>
                        </div>
                        <nav className="collapse navbar-collapse bs-navbar-collapse" role="navigation">
                            <ul className="nav navbar-nav">
                                {this.mainLinks}
                            </ul>
                            <ul className="nav navbar-nav navbar-right">
                                {this.sideLinks}
                            </ul>
                        </nav>
                    </div>
                </header>
                <div id="body">
                    {this.renderContent()}
                </div>
                <div className="container">
                    <div className="pull-right" style={{margin: "20px 0 0 0"}}>{useInfo}</div>
                    <h4 className="pull-left" style={{margin: "20px 0 0 0"}}>{clientName}</h4>
                    <div style={{padding: "10px 0 0 0"}}>
                        <a id="accessibilityOptionsButton" onClick={this.accessabilityOptions.bind(this)} role="button" className="btn btn-default" style={{margin:"0 0 0 10px"}} data-toggle="modal" data-backdrop="false"><i className="icon-adjust" /> Accessibility Options</a>
                    </div>
                    <div className="clear-fix"></div>
                    <hr style={{margin:"10px 0"}} />
                    <footer>
                        <div className="panel pull-right">
                            <div className="panel-body">
                                {this.client.image ? <img className="pull-right" src={this.client.image} style={{marginLeft:10,maxHeight:70}} /> : null}
                                <img className="pull-right" src="https://doitprofiler.net/images/logo-doit.gif" style={{marginTop:10,maxHeight:50}} />
                            </div>
                        </div>
                        <p>© 2016 Do-IT Solutions Ltd</p>
                    </footer>
                    <div className="clear-fix"></div>
                    <div style={{padding:"10px 20px 20px"}} className="pull-right">
                        <ExpandableMenu data={[
                            { id: 0, name: "Switch Client", callback: this.switchClient.bind(this) },
                            { id: 1, name: "Edit Client", callback: this.editClient.bind(this) },
                            "divider",
                            { id: 3, name: "Language Settings", callback: this.languageSettings.bind(this) }
                        ]} icon="icon-cog" position="right" expandDir="up" />
                    </div>
                </div>
            </div>
        );
    }

    // To be overwritten
    renderContent(){
        return <code>{this.props.route.path}</code>;
    }

    languageSettings(){
        var real = this.props.actions.openWindow(
            null,
            this.props.locale.getLocaleString("AccessibilityOptions"),
            "Coś tu pasoałoby napisać ;P",
            undefined,
            {
                style : { maxWidth : 555 },
                buttons : ["A","Ok","Cancel"],
                buttonFunctions : [()=>console.log(real),()=>alert('Hurra!'),()=>this.props.actions.closeWindow(real)]
            }
        ).id;
    }
    editClient(){
        console.log('Edit client ???');
    }
    switchClient(){
        console.log('Switch to another client (should open modal)');
    }
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
        let react = Reactify(this.props.locale.getLocaleString("AccessibilityOptions_AdjuctingTextSize_Info").replace(/CTRL/g,navigator.platform.toString().indexOf("Mac") > -1 ? "Command" : "Ctrl"));
        // let dangerousHTML = {
        //     __html : this.props.locale.getLocaleString("AccessibilityOptions_AdjuctingTextSize_Info")
        //         .replace(/CTRL/g,navigator.platform.toString().indexOf("Mac") > -1 ? "Command" : "Ctrl")
        // };
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
                {/*<span dangerouslySetInnerHTML={dangerousHTML} />*/}
                {react}
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

module.exports = Index;
