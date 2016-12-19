import React, { Component } from 'react';
import { render } from 'react-dom';
import PopupWindow from '../PopupWindow/popupWindow';
import { Storage } from '../Utils/utils';
import { signout } from '../Utils/commonActions';

class ClientLogin extends Component {
    constructor(props) {
        super(props);
    }
    showWindow(e){
        e.preventDefault && e.preventDefault();
        render(<PopupWindow type="info" content="Some content to be displayed" name="TempWindow" buttons={["ok"]} actions={{}} />,document.getElementById('popup'));
    }
    static fillError(errorMsg){
        let e = document.getElementById('errorMessage');
        if(!e) return;
        e.innerHTML = "";
        if(errorMsg){
            let close = e.appendChild(document.createElement('a'));
            close.innerText = 'x';
            close.href = 'javascript:void(0);';
            close.onclick = function(ev){
                ev.preventDefault && ev.preventDefault();
                ClientLogin.fillError(null);
                return false;
            };
            e.appendChild(document.createElement('span')).innerHTML = errorMsg;
        }
    }
    static fillProgressStatus(status){
        let e = document.getElementById('loginProgress');
        if(e) e.innerHTML = status || "";
    }
    componentWillMount(){
        this.clientChosen = Storage.getItem('clientCode') || undefined;
    }

    render() {
        return (
            <div styleName="clientLogin">
                <header className="primary-colour-bg">
                    <div className="container">
                        <div className="navbar-header">
                            <a href="/">
                                <img width="81" height="21" className="logo hidden-xs" src="/images/logo-doit.svg" />
                            </a>
                        </div>
                    </div>
                </header>
                <div id="body">
                    <div className="container">
                        <form className="form-login" styleName="form-login" onSubmit={e=>(e.preventDefault && e.preventDefault(),this.props.handleLogin(),false)}>
                            <h2>Client Code Login</h2>
                            <br/>
                            <div id="errorMessage" />
                            <label className="sr-only" htmlFor="ClientCode">Client Code</label>
                            <input autoFocus={true} id="ClientCode" name="ClientCode" placeholder="Enter Client Code:" required="true" type="text" value={this.clientChosen} readOnly={this.clientChosen} />
                            <br/>
                            <div id="loginProgress" />
                            <button type="submit">{this.clientChosen?"Authenticate":"Go"}</button>
                            <br/>
                            <a href="#" onClick={this.showWindow}>
                                What is my Client Code?
                            </a>
                            {this.clientChosen ? <button id="exitSystem" type="button" onClick={signout}>Exit System</button> : null}
                        </form>
                    </div>
                </div>
                <div className="container">
                    <div className="clear-fix" />
                    <hr style={{margin:"10px 0"}} />
                    <footer>
                        <p>© 2016 Do-IT Solutions Ltd</p>
                    </footer>
                    <div className="clear-fix"></div>
                </div>
            </div>
        );
    }
}

ClientLogin.propTypes = {
    handleLogin: React.PropTypes.func.isRequired
};

import CSSModules from 'react-css-modules';
import scsses from './clientLogin.scss';
export default CSSModules(ClientLogin,scsses);