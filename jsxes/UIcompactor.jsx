import React from 'react';
import { render } from "react-dom";
import ClientLogin from './ClientLogin/clientLogin';
import $ from '../statics/js/ajax';

// $.setDebug(true);
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

function getClientData() {
    let data = {
        token: "6TDFLRFJ7M",
        "$filter": "Code eq '" + decodeURIComponent(localStorage.getItem('clientCode')) + "'",
        "$select": "ClientId,HasLogo,Name,Tests,IntroductionText,BrandingText,APIAccessKey"
    };
    $.ajax({
        authenticate: 1,
        url: 'http://doitwebapitest.azurewebsites.net/api/2.0/Client',
        data,
        done : d => {
            if(d.length) {
                console.log('done %o', d);
                localStorage.setItem('clientData',encodeURIComponent(JSON.stringify(d)));
                getUserData(d.ClientId, d.APIAccessKey);
            }
        },
        fail : d => console.error(d),
        always : d => console.info(d)
    });
}
function getUserData(clientId,accessToken) {
    let data = {
        token: accessToken,
        "$filter": "ClientId eq " + clientId
    };
    $.ajax({
        authenticate: 1,
        url: 'http://doitwebapitest.azurewebsites.net/api/2.0/User',
        data: data,
        beforeSend: ()=> console.log(data),
        done : d => console.log(d),
        fail : d => console.error(d),
        always : d => console.info(d)
    });
}
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
    getClientData();
    drawUI(1);
},function(){
    checkLogout();
    drawUI(0);
    render(
        <ClientLogin handleLogin={ev=>{
            if(ev && ev.preventDefault) ev.preventDefault();
            document.querySelector('form.form-login input').disabled = document.querySelector('form.form-login button').disabled = true;
            let clientCode = document.getElementById('ClientCode').value;
            if(!clientCode){
                ClientLogin.fillError("You have to supply Client Code to proceede");
                return document.querySelector('form.form-login input').disabled = document.querySelector('form.form-login button').disabled = false;
            }
            if(document.getElementById('errorLabel')){
                ClientLogin.fillError("");
            }
            window.client.settings._acr_values = "clientCode:"+clientCode;
            window.client.createSigninRequest({ state: { foo: 'bar_'+(+(new Date())) } }).then(function(req) {
                localStorage.setItem('clientCode', encodeURIComponent(clientCode));
                window.location = req.url;
            }).catch(function(err){
                localStorage.removeItem('clientCode');
                ClientLogin.fillError(JSON.stringify(err));
                document.querySelector('form.form-login input').disabled = document.querySelector('form.form-login button').disabled = false;
            });
        }} />,
        document.getElementById('ContentHolder')
    );
 });

function drawUI(doShow){
    require.ensure(['./UI/ui.jsx'],function(){
        let Provider = require('./FluxImpl/Provider/ProviderDebug');
        let UI = require('./UI/ui.jsx');

        if(doShow){
            render((
                <Provider>
                    <UI />
                </Provider>
            ), document.getElementById('ContentHolder'));
        }
    },'ui');
}


