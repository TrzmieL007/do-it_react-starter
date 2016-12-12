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
        globalVariable[key] = value;
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
            return JSON.parse(decodeURIComponent(atob(out)));
        } catch (e) {
            return out;
        }
    };
    static storeBookOnAShelf(bookName, book, ss){
        if(typeof book === 'object'){
            book = btoa(encodeURIComponent(JSON.stringify(book)));
        }
        let storage = BookKeeper.getStoreage(ss);
        if(storage){
            storage.setItem(bookName, book);
        }else{
            CookieMonster.bakeACookie(bookName, book);
        }
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
    static removeItem(bookName, ss){
        BookKeeper.burnTheBook(bookName, ss);
    };
    static getItem(bookName, ss){
        return BookKeeper.getBookFromAShelf(bookName, ss)
    };
    static setItem(bookName, book, ss){
        BookKeeper.storeBookOnAShelf(bookName, book, ss);
    };
    static hasOwnProperty(bookName, ss){
        return BookKeeper.hasBook(bookName, ss);
    }
}