import React from 'react';
import { render } from "react-dom";
import ClientLogin from './ClientLogin/clientLogin';
import { Storage } from './Utils/utils';
import $ from '../statics/js/ajax';

// $.setDebug(true);
let oidSettings = {
    authority: 'https://accounts.doitprofiler.net/',
    client_id: 'ClientAssessments',
    redirect_uri: 'http://localhost:8080',
    post_logout_redirect_uri: 'http://localhost:8080',
    response_type: 'id_token token',
    scope: 'openid profile email roles sampleAPI',
    // acr_values: "clientCode:pda14mag",

    filterProtocolClaims: true,
    loadUserInfo: true
};

window.client = new Oidc.OidcClient(oidSettings);

function getClientData() {
    if(Storage.getItem('clientData')) return getUserData();
    let data = {
        "$filter": "Code eq '" + Storage.getItem('clientCode') + "'",
        "$select": "ClientId,HasLogo,Name,Tests,IntroductionText,BrandingText,APIAccessKey"
    };
    ClientLogin.fillProgressStatus('Fetching Client data...');
    $.ajax({
        authenticate: 1,
        url: '/Client',
        data,
        done : d => {
            if(d.length) {
                let cl = d[0];
                Storage.setItem('clientData',cl);
                getUserData();
            }
        },
        fail : d => console.error(d)
    });
}
function getUserData() {
    let email = Storage.getItem('profile').email;
    let data = {
        "$filter": "Email eq '" + email + "'"
    };
    ClientLogin.fillProgressStatus('Fetching User data...');
    $.ajax({
        authenticate: 1,
        url: '/User',
        data: data,
        done : d => {
            Storage.setItem('userData',d[0]);
            drawUI(1);
        },
        fail: d => console.error(d),
    });
}
function checkLogin(){
    if(window.location.hash.match(/^#\/.+/)) {
        Storage.setItem('hash', window.location.hash, true);
    }
    return new Promise(function(resolve,reject) {
        let ea;
        if(window.location.hash.match(/^#id_token=.+/)){
            window.client.processSigninResponse().then(function (response){
                window.signinResponse = response;
                console.log(response);
                Storage.setItem('expires_at', response.expires_at);
                Storage.setItem('profile', response.profile);
                Storage.setItem('id_token', response.id_token);
                localStorage.setItem('access_token', response.access_token);
                window.history.replaceState(null, 'SignedIn', window.location.href.replace(window.location.hash, Storage.popItem('hash',true) || ''));
                return resolve();
            }).catch(function(err){
                console.error('ERROR: %o', err);
                return reject();
            });
        }else if (!!(ea = Storage.getItem('expires_at')) && (ea * 1000 > +(new Date()))){
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
    // render(<ClientLogin handleLogin={()=>null} disabled={true} />,document.getElementById('ContentHolder'));
    // getClientData();
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
            ClientLogin.fillProgressStatus('Prepering Login request...');
            if(document.getElementById('errorLabel')){
                ClientLogin.fillError("");
            }
            window.client._settings._acr_values = "clientCode:"+clientCode;
            {/*oidSettings.acr_values = "clientCode:"+clientCode;*/}
            {/*window.client = new Oidc.OidcClient(oidSettings);*/}
            window.client.createSigninRequest({ state: { foo: 'bar_'+(+(new Date())) } }).then(function(req) {
                Storage.setItem('clientCode', clientCode);
                ClientLogin.fillProgressStatus('Authenticating user...');
                window.location = req.url;
            }).catch(function(err){
                Storage.removeItem('clientCode');
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


