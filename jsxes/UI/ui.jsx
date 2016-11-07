import './ui.scss';
import React, { Component } from 'react';
import $ from '../../statics/js/ajax';

import Main from '../Main/main';
import TEMP_1 from '../TEMP_1/temp_1';
import TEMP_2 from '../TEMP_2/temp_2';
import { Router, Route, hashHistory } from 'react-router'

class UI extends Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {

    }

    signout(){
       window.client.createSignoutRequest({ id_token_hint: window.signinResponse && window.signinResponse.id_token, state: { foo: 'bar' } }).then(function(req) {
           localStorage.removeItem('expires_at');
           localStorage.removeItem('profile');
           localStorage.removeItem('id_token');
           localStorage.removeItem('access_token');
           window.location = req.url;
       });
    }

    sendTestRequestWithA() {
        $.ajax({
                url: 'http://doitwebapitest.azurewebsites.net/api/2.0/Test/',
                data: { token : 'F00B9522AD5C' }, // pda16mag
                done: result => {
                        console.log(result);
                    },
                fail: $.fail,
                always: (response,status) => {
                    console.group('always');
                    console.log(response);
                    console.log(status);
                    console.groupEnd();
                },
                authenticate: true
            });
    }

    render() {
        return (
            <div className="UI">
                <button onClick={this.signout} style={{textAlign:'right'}}>Signout</button><p/>
                <Router history={hashHistory}>
                    <Route path="/" component={Main}/>
                    <Route path="/tmp1" component={TEMP_1}/>
                    <Route path="/tmp2" component={TEMP_2}/>
                </Router>
                <button onClick={this.sendTestRequestWithA}>Send test request to api with authentication header</button>
            </div>
        );
    }
}

UI.propTypes = {

};

module.exports = UI;