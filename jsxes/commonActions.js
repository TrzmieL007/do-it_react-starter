/**
 * Created by trzmiel007 on 25/11/16.
 */

export default class CommonActions {
    /**
     * Logs out user and removes connected data from localStorage
     */
    static signout(){
        window.client.createSignoutRequest({ id_token_hint: window.signinResponse && window.signinResponse.id_token, state: { foo: 'bar' } }).then(function(req) {
            localStorage.removeItem('clientCode');
            localStorage.removeItem('expires_at');
            localStorage.removeItem('profile');
            localStorage.removeItem('id_token');
            localStorage.removeItem('access_token');
            window.location = req.url;
        });
    }
    static feedbackModal(){
        if(this.actions && this.actions.openWindow){
            let x = this.actions.openWindow(null, 'Feedback', 'Now I just need to fill this window with content :)');
            let id = x.id;
            console.log("id = %o, and function returned %o",id,x);
        }else{
            console.log('No actions, I need to figure out how to do it :/ %o',this);
        }
    }

    /**
     * Gets user data from localStorage, if supplied any arguments as strings, this method will return those values
     * if they are present in localStorage profile.<br/>
     * <i>By default it returns email address</i>
     * @returns {{}}
     */
    static getUserData(){
        let userData = JSON.parse(atob(localStorage.getItem('profile')));
        let fields = arguments.length ? Array.prototype.slice.call(arguments) : ["email"];
        let userDataObj = {};
        fields.forEach(f => userDataObj[f] = userData[f]);
        return userDataObj;
    }

    /**
     * Gets client data. Containing clientCode + any other data asked for as string arguments if they are accessible
     * and a sufficient method was written for it (or mock data).<br/>
     * <i>By default it also returns client image file url</i>
     * @returns {{clientCode: string}}
     */
    static getClientData(){
        let fields = arguments.length ? Array.prototype.slice.call(arguments) : ["image"];
        let clientData = { clientCode: decodeURIComponent(localStorage.getItem('clientCode')) };
        fields.forEach(f => clientData[f] = this.getClientProperty(f,/*this param to be removed if not needed anymore*/clientData.clientCode));
        return clientData;
    }

    /**
     * Returns a param value for client. Right now it is a mock with some data.
     * @param name  - param name
     * @param cc    - clientCode (remove if not neccessary any more)
     * @returns {*}
     */
    static getClientProperty(name,cc){
        switch(name){
            // TODO: replace this hardcoded mock!
            case 'image': return cc.toLowerCase() == 'dyslexia+' ? 'https://doitcdn.azureedge.net/shared/images/thumbs/0001067_200_150.jpeg' : null;
            default: return null;
        }
    }

    /**
     * Deep compares two object if they are the same (even if they are complex objects).
     * @param o1 - first object
     * @param o2 - second object
     * @returns {boolean}
     */
    static compareObj(o1, o2){
        if(Object.keys(o1).length != Object.keys(o2).length) return false;
        return Object.keys(o1).every(k => typeof o1[k] == typeof o2[k] && ((typeof o1[k] == 'object' && compareObj(o1[k],o2[k])) || o1[k] === o2[k]));
    }

    /*sendTestRequestWithA() {
        $.ajax({
            url: 'http://doitwebapitest.azurewebsites.net/api/2.0/Test/',
            data: { token : 'F00B9522AD5C' }, // pda14mag
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
    }*/
}