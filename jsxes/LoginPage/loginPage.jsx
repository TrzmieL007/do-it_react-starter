import './loginPage.scss';
import React, { Component } from 'react';

class LoginPage extends Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {

    }

    render() {
        return (
            <div className="loginPage">
                <div className="bg" />
                <div className="loginForm">
                    <div className="logoTop">
                        <div className="logoImage" />
                        <div className="logoText">Do-IT</div>
                    </div>
                    <form onSubmit={this.props.handleLogin}>
                        <div className="clientCode">
                            <label htmlFor="clientCodeInput">Username</label>
                            <input id="clientCodeInput" type="text" autoFocus placeholder="gauwec15stl || pda14mag" pattern="^[a-zA-Z0-9]+$" />
                        </div>
                        <span id="errorLabel"></span>
                        <div className="loginFooter">
                            <button className="button clickable" type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}

LoginPage.propTypes = {
    handleLogin: React.PropTypes.func.isRequired
};

export default LoginPage;