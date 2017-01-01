/**
 * Created by trzmiel007 on 07/12/16.
 */
let globalVariable = {};

export class CookieMonster {
    static eatAllCookies(){
        document.cookie.split(/;\s*/).forEach(cookie => document.cookie = cookie.replace(/\s*\=\s*([^;]*).*$/, '=error') + ";expires=" + new Date().toUTCString());
    }
    static eatACookie(cookie) {
        if(cookie.indexOf('=')) cookie = cookie.replace(/\s*\=\s*([^;]*).*$/, '');
        document.cookie = cookie + "=error;expires=" + new Date().toUTCString();
    }
    /**
     * Creates a cookie.
     * @param {string} cookieName - string
     * @param {string} cookieIngredients - sting
     * @param {Date} [cookieExpirationDate] - Date object
     */
    static bakeACookie(cookieName, cookieIngredients, cookieExpirationDate) {
        document.cookie = cookieName + "=" + cookieIngredients + (cookieExpirationDate ? ";expires=" + cookieExpirationDate.toUTCString() : '');
    }
    /**
     * Returns a value of the cookie with name <code>cookieName</code>
     * @param cookieName
     * @returns {string}
     */
    static getACookieFromAPlate(cookieName){
        return document.cookie.replace(new RegExp("(?:(?:^|.*;\\s*)" + cookieName + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1");
    }
    static getAllCookies(){
        return document.cookie.split(/;\s*/).map((c,i,a)=>a[i]=c.replace(/^(.)*=/,''));
    }
    static getAllCookieNames(){
        return document.cookie.split(/;\s*/).map((c,i,a)=>a[i]=c.replace(/=(.)*$/,''));
    }
    static hasACookie(cookieName){
        return new RegExp("(?:^|.*;\\s*)" + cookieName + "\\s*\\=\\s*([^;]*).*$").test(document.cookie);
    }
}

class VariableStorage {
    static keys(){
        return Object.keys(globalVariable);
    }
    static removeItem(key){
        delete globalVariable[key];
    }
    static getItem(key){
        return globalVariable[key];
    }
    static setItem(key,value){
        return globalVariable[key] = value;
    }
    static clear(){
        globalVariable = {};
    }
}

export class BookKeeper {
    static checkForLocalStorage() {
        return 'localStorage' in window && window['localStorage'] !== null;
    }
    static checkForSessionStorage(){
        return 'sessionStorage' in window && window['sessionStorage'] !== null;
    }
    static checkForCookies(){
        return 'cookie' in document;
    }
    static getStoreage(ss){
        if(ss && BookKeeper.checkForSessionStorage())
            return window.sessionStorage;
        if(BookKeeper.checkForLocalStorage())
            return window.localStorage;
        if(!this.checkForCookies())
            return VariableStorage;
        return false;
    }
    static getLibraryIndex(ss){
        let storage = BookKeeper.getStoreage(ss);
        if(storage) return Object.keys(storage);
        return CookieMonster.getAllCookieNames();
    }
    static getAllBooks(ss){
        let storage = BookKeeper.getStoreage(ss);
        if(storage) return Object.keys(storage).map(c => p.push(JSON.parse(atob(storage[c]))));
        return CookieMonster.getAllCookies().map(c=> JSON.parse(atob(c)));
    }
    static burnTheLibrary(ss){
        let storage = BookKeeper.getStoreage(ss);
        if(storage){
            storage.clear();
        }else{
            CookieMonster.eatAllCookies();
        }
    }
    static burnTheBook(bookName,ss){
        let storage = BookKeeper.getStoreage(ss);
        if(storage){
            storage.removeItem(bookName);
        }else{
            CookieMonster.eatACookie(bookName);
        }
    };
    static getBookFromAShelf(bookName,ss){
        let storage = BookKeeper.getStoreage(ss);
        let out = storage ? storage.getItem(bookName) : CookieMonster.getACookieFromAPlate(bookName);
        try {
            out = out ? decodeURIComponent(atob(out)) : out;
            return JSON.parse(out);
        } catch (e) {
            return out;
        }
    };
    static storeBookOnAShelf(bookName, book, ss){
        if(typeof book === 'object'){
            book = btoa(encodeURIComponent(JSON.stringify(book)));
        }else{
            book = btoa(encodeURIComponent(book));
        }
        let storage = BookKeeper.getStoreage(ss);
        if(storage){
            storage.setItem(bookName, book);
        }else{
            CookieMonster.bakeACookie(bookName, book);
        }
        return BookKeeper.getBookFromAShelf(bookName,ss);
    };
    static hasBook(bookName,ss){
        let storage = BookKeeper.getStoreage(ss);
        if(storage){
            return storage.hasOwnProperty(bookName);
        }else{
            return CookieMonster.hasACookie(bookName);
        }
    }
}

export class Storage {
    static hasLocalStorage(){
        return BookKeeper.checkForLocalStorage();
    }
    static hasSessionStorage(){
        return BookKeeper.checkForSessionStorage();
    }
    static hasCookies(){
        return BookKeeper.checkForCookies();
    }
    static keys(ss){
        return BookKeeper.getLibraryIndex(ss)
    }
    static values(ss){
        return BookKeeper.getAllBooks(ss);
    }
    static clear(ss){
        BookKeeper.burnTheLibrary(ss);
    }
    static removeItem(itemName, ss){
        BookKeeper.burnTheBook(itemName, ss);
    };
    static getItem(itemName, ss){
        return BookKeeper.getBookFromAShelf(itemName, ss)
    };
    static setItem(itemName, item, ss){
        return BookKeeper.storeBookOnAShelf(itemName, item, ss);
    };
    static hasOwnProperty(itemName, ss){
        return BookKeeper.hasBook(itemName, ss);
    }

    static popItem(itemName, ss){
        let item = BookKeeper.getBookFromAShelf(itemName, ss);
        return item ? (BookKeeper.burnTheBook(itemName, ss),item) : null;
    }
}

import $ from '../../statics/js/ajax';
export class DataFetch {
    constructor(config){
        this.APIprefix = config.apiPrefix || $.getAPIuri();
        this.dataInvalidated = config.invalidatedEndpoints || {};
        this.registeredCalls = {};
        this.removeFromStorage = pattern => {
            for(let i = 0; i < localStorage.length; ++i){
                let key = localStorage.key(i);
                if(key.match(pattern)) localStorage.removeItem(key);
            }
        };

        // Purly debug :)
        this.debug = config.debug;
        this.name = config.name;
        this.creationTime = new Date();
        if(this.debug){
            console.trace("DataFetch '%s' was created on %s",this.name,this.creationTime);
            $.setDebug(true);
        }
    }

    /**
     * A function to which you pass coma separated endpoints which you want to fetch data from, even if the data is in the storage.<br/>
     * You can also pass one argument as an array of endpoints to invalidate.
     */
    invalidateEndpoints(){
        (Array.isArray(arguments[0]) ? arguments[0] : [].slice.call(arguments)).forEach(arg => {
            switch(arg){
                case "Test":
                    this.removeFromStorage(/^assessmentHeader-id[0-9]+$/);
                    break;
                case "Assessment":
                    this.removeFromStorage(/^id[0-9]+$/);
                    break;
                case "Survey":
                    this.removeFromStorage(/^sid[0-9]+$/);
                    break;
                default:
                    this.dataInvalidated[arg] = true;
            }
        });
    }

    /**
     * Gets the data either from localStorage if present already otherwise straight from API.<br/>
     * <b>config</b> object structure:
     * <ul>
     *     <li>endpoint <small>(string)</small><sup>(r)</sup> - API endpoint name (without api url or leading slash),</li>
     *     <li>storeName <small>(string)</small> - name that the data is or should be stored under,</li>
     *     <li>sessionStorage <small>(bool)</small> - true if should be stored in session storage instead of localStorage <i><b>(default: false)</b></i>,</li>
     *     <li>method <small>(string)</small> - request method <i><b>(default: GET)</b></i>,</li>
     *     <li>data <small>(object or <i>application/x-www-form-urlencoded</i> string)</small> - data to be sent with the request,</li>
     *     <li>
     *         done <small>(function)</small> - function to invoke after successful data fetch.
     *         <strong>!Important: This function has to return formated data to be stored in localStorage if storeName specified<br/>
     *         (if it's taken from the store it does not replace it with returned object, If you need it to, then you have to do it inside the function)</strong>
     *         First argument is the returned data, and second tells if the data was fetched from localStorage (already parsed for localStorage),
     *     </li>
     *     <li>success <small>(function)</small> - alias for done function,</li>
     *     <li>fail <small>(function)</small> - like normal fail function in ajax (invoked on request failure),</li>
     *     <li>always <small>(function)</small> - like normal always function in ajax (invoked on readyState == 4 regardless of the request request (status)),</li>
     *     <li>beforeSend <small>(function)</small> - function that is invoked just before the request is sent (receives xmlDoc as first argument),</li>
     *     <li>async <small>(bool)</small> - should the request be asynchronous <i><b>(default: true)</b></i>,</li>
     *     <li>onProgress <small>(function)</small> - function that is invoked on progress event of the request. Receives <code>progress</code> event.</li>
     *     <li>callerName <small>(string)</small> - name under which the request is kept (in case you want to abort it eg. on componentWillUnmount, then store it under className).</li>
     * </ul>
     * <sup>(r)</sup> - required field.
     * @param config
     * @returns {*}
     */
    getData(config) {
        let start = +(new Date());
        let ls = config.storeName ? this.dataInvalidated.hasOwnProperty(config.endpoint)
            ? Storage.removeItem(config.storeName, config.sessionStorage)
            : Storage.getItem(config.storeName, config.sessionStorage) : null;
        if(!ls){
            let xmlDoc = $.ajax({
                methog: config.method || 'GET',
                url: this.APIprefix + '/' + config.endpoint,
                data: config.data,
                authenticate: 1,
                done: d => {
                    if(this.debug) console.info("Got data from API and that took me %s ms", +(new Date) - start);
                    let processedData;
                    if(config.done) processedData = config.done(d);
                    if(config.success) processedData = config.success(d);
                    if(config.storeName && processedData) Storage.setItem(config.storeName, processedData, config.sessionStorage);
                },
                fail : config.fail || this.debug ? $.fail.bind(this,()=>console.info("Failed to get data from API after %s ms", +(new Date) - start)) : undefined,
                always: config.always,
                beforeSend: config.beforeSend,
                async: config.async,
                onProgress: config.onProgress
            });
            let putItHere = this.registeredCalls;
            if(config.callerName){
                if(!this.registeredCalls.hasOwnProperty(config.callerName)) this.registeredCalls[config.callerName] = {};
                putItHere = this.registeredCalls[config.callerName];
            }
            xmlDoc.addEventListener('readystatechange', () => (xmlDoc.readyState == 4 ? delete putItHere[xmlDoc.identifier] : null));
            return putItHere[xmlDoc.identifier] = xmlDoc;
        }
        if(config.done && typeof config.done == 'function') config.done(ls,true);
        if(config.success && typeof config.success == 'function') config.success(ls,true);
        if(this.debug) console.info("Got data from Storage and that took me %s ms.\nThe data %o", +(new Date) - start,ls);
    }

    /**
     * Abort all unfinished requests if the readyState has not achieved 4.
     * @param callerName - caller name that was used in getData, if null it abort all request that haven't finished yet
     */
    stopUnfinished(callerName){
        if(callerName && this.registeredCalls[callerName]){
            Object.keys(this.registeredCalls[callerName]).forEach(x => this.registeredCalls[callerName][x].abort());
            delete this.registered[callerName];
        }else if(!callerName){
            Object.keys(this.registeredCalls).forEach(k => {
                if(this.registeredCalls[k].constructor.name == "XMLHttpRequest")
                    this.registeredCalls[k].abort();
                else if(this.registeredCalls[k].constructor.name == "Object")
                    Object.keys(this.registeredCalls[k]).forEach(x => this.registeredCalls[k][x].abort());
                delete this.registeredCalls[k];
            });
        }
    }

    /**
     * More debug function to get all calls that were registered
     * @returns {{}|*}
     */
    getRegisteredCalls() {
        return this.registeredCalls;
    }

    /**
     * Just a debugging function
     * @returns {string}
     */
    whoAreYou(){ return "I am DataFetch, my name is '"+this.name+"', I was created on "+this.creationTime+"."; }
}

export let dataFetch = new DataFetch({ name : 'DefaultCreated', debug: true });