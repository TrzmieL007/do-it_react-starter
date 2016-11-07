import React from 'react';
import { render } from "react-dom";
import LoginPage from './LoginPage/loginPage';


var oidSettings = {
    authority: 'https://accounts.doitprofiler.net/',
    client_id: 'ClientAssessments',
    redirect_uri: 'http://localhost:8080',
    post_logout_redirect_uri: 'http://localhost:8080',
    response_type: 'id_token token',
    scope: 'openid profile email roles sampleAPI',
    acr_values: "clientCode:pda14mag",

    filterProtocolClaims: true,
    loadUserInfo: true
};

window.client = new Oidc.OidcClient(oidSettings);

function checkLogin(){
    return new Promise(function(resolve,reject) {
        var ea;
        if(window.location.hash.match(/^#id_token=.+/)){
            window.client.processSigninResponse().then(function (response){
                window.signinResponse = response;
                console.log(response);
                localStorage.setItem('expires_at', response.expires_at);
                localStorage.setItem('profile', btoa(JSON.stringify(response.profile)));
                localStorage.setItem('id_token', response.id_token);
                localStorage.setItem('access_token', response.access_token);
                window.history.replaceState(null, 'SignedIn', window.location.href.replace(window.location.hash, ''));
                return resolve();
            }).catch(function(err){
                console.error('ERROR: %o', err);
                return reject();
            });
        }else if (!!(ea = localStorage.getItem('expires_at')) && (ea * 1000 > +(new Date()))){
            return resolve();
        }else{
            return !!window.signinResponse ? resolve() : reject();
        }
    });
}
function checkLogout(){
    if(window.location.search.match(/^\?state=.+/)){
        try{
            window.client.processSignoutResponse().then(function(response){
                window.signinResponse = null;
                window.history.replaceState(null, 'SignedOut', window.location.href.replace(window.location.hash, ''));
            }).catch(function (err) {
                console.log(err);
            });
        }catch(e){}
        return true;
    }
}

checkLogin().then(function(){
    drawUI(1);
},function(){
    checkLogout();
    drawUI(0);
    render(<LoginPage handleLogin={ev=>{
        if(ev && ev.preventDefault) ev.preventDefault();
        var clientCode = ev&&ev.target?ev.target[0].value:document.getElementById('clientCodeInput').value;
        if(document.getElementById('errorLabel')){
            document.getElementById('errorLabel').innerHTML = "";
        }
        window.client.settings._acr_values = "clientCode:"+clientCode;
        window.client.createSigninRequest({ state: { foo: 'bar_'+(+(new Date())) } }).then(function(req) {
            window.location = req.url;
        }).catch(function(err){
            console.log(err);
        });
    }} />,document.getElementById('ContentHolder'));
 });

function drawUI(doShow){
    require.ensure(['./UI/ui.jsx'],function(){
        let createStore = require('redux').createStore;
        let Provider = require('react-redux').Provider;
        let UI = require('./UI/ui.jsx');
        let reducers = require('./Store/reducers.js');
        const store = createStore(reducers);

        if(doShow){
            render((
                <Provider store={store}>
                    <UI />
                </Provider>
            ), document.getElementById('ContentHolder'));
        }
    },'ui');
}


