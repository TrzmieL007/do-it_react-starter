import React, { Component } from 'react';
import { render } from 'react-dom';
import PopupWindow from '../PopupWindow/popupWindow';

class ClientLogin extends Component {
    constructor(props) {
        super(props);
    }
    showWindow(e){
        e.preventDefault && e.preventDefault();
        render(<PopupWindow type="info" content="Some content to be displayed"/>,document.getElementById('popup'));
    }
    static fillError(errorMsg){
        let e = document.getElementById('errorMessage');
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

    render() {
        return (
            <div className="clientLogin">
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
                            <input autoFocus={true} id="ClientCode" name="ClientCode" placeholder="Enter Client Code:" required="true" type="text" />
                            <br/>
                            <button type="submit">Go</button>
                            <br/>
                            <a href="#" onClick={this.showWindow}>
                                What is my Client Code?
                            </a>
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