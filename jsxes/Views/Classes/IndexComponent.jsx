import React from 'react';
import Navigation from '../../NavigationTree';
import Link from 'react-router/lib/Link';
import style from '../../ScssStyles/general.scss';
import common from '../../commonActions';

class Index extends React.Component {
    constructor(props){
        super(props);
        var linkCreator = (p,v,i) =>
            (p.push(<li key={i} className={v.side?"visible-xs":"visible-md visible-lg"}>
                <Link to={v.path} activeClassName="active" {...v.props} onClick={typeof v.callback=='function'?v.callback.bind(props):null}>
                    <i className={v.icon} /> {v.title}
                </Link>
            </li>,<li key={i+'sm'} className={v.side?"hidden-xs":"visible-sm"}>
                <Link to={v.path} activeClassName="active" {...v.props} aria-label={v.title||v.alt} data-original-title={v.title||v.alt} onClick={typeof v.callback=='function'?v.callback.bind(props):null}>
                    <i className={v.icon} />
                </Link>
            </li>),p);
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
                        <div className="btn-group dropup">
                            <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                <i className="icon-cog" /> <span className="caret" />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-right">
                                <li><a onClick={this.switchClient} data-toggle="modal">Switch Client</a></li>
                                <li><a onClick={this.editClient}>Edit Client</a></li>
                                <li className="divider"/>
                                <li><a onClick={this.languageSettings} data-toggle="modal">Language Settings</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // To be overwritten
    renderContent(){
        return <code>{this.props.route.path}</code>;
    }


    createClientDataRequest(){
        return "http://doitwebapitest.azurewebsites.net/api/2.0/Client?token=6TDFLRFJ7M&$filter=Code eq '" + this.props.appState.client.clientCode + "'"
        +"&$select=ClientId, Name, Registration, UsernameIsEmail, UserCount, PrimaryUserId, "+
        "UsernameIsGenerated, HideEmailField, UserDOBIsYearOnly, PasswordIsGenerated, MultipleInstitutions, SystemBrandingId, " +
        "ShowMarkAsCompleted, EnableLanguageRestriction, UsernameGenerationTypeId, APIAccessKey, LanguageId, AllowRetakeTest, HasLogo, ShowPreTestQuestions, CustomRandomisedAssessments";
    }

    languageSettings(){
        console.log('Language settings (should open modal)');
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
                null,
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
            null,
            { style : { maxWidth : 555 } }
        );
    }
}

module.exports = Index;
