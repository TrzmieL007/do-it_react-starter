/**
 * Created by trzmiel007 on 04/11/16.
 */

function getXmlDoc(){
    return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
}

var authenticate;
var debug;
var error = new Error('Wrong data object supplied. It should be string or object with primitive types');

function reduceData(array,key,data){
    return array.reduce(function(p,c){
        var cur = encodeURIComponent(data ? data[c] : c);
        if(typeof cur === 'object' && cur !== null){
            if(Array.isArray(cur) && data){
                cur = reduceData(cur,c).replace(new RegExp("(^"+c+"=)(.+)(&$)"),"$2");
            }
            throw error;
        }
        return p + encodeURIComponent(data ? c : key) + "=" + cur + "&";
    }, "");
}

function parseData(data){
    if(!data){
        return "";
    }
    if(typeof data === "string"){
        return data.substr(0, 1) === '?' ? data.substr(1) : data;
    }
    if(typeof data !== 'object'){
        throw error;
    }
    return reduceData(Object.keys(data),null,data).replace(/&$/, "");
}

function handleStateChange(xmlDoc, done, fail, always, p, c, a){
    if(xmlDoc.readyState === 4){
        let err = null;
        switch(xmlDoc.status){
            case 200:
                let res;
                try {
                    res = /*c && c.json ?*/ JSON.parse(xmlDoc.responseText)/* : xmlDoc.responseText*/;
                }catch(e){
                    if(c && c.json){
                        err = e.message;
                    }else{
                        res = xmlDoc.responseText;
                    }
                }
                if(!err){
                    done && done instanceof Function ? (a ? setTimeout(()=>done.call(undefined, res, xmlDoc.responseURL),0) : done.call(undefined, res, xmlDoc.responseURL)) : null;
                    break;
                }
            default: if(p){ p.classList.add('error'); }
                fail && fail instanceof Function ? (a ? setTimeout(()=>fail.call(undefined,
                    { responseText: err ? err : xmlDoc.responseText, responseURL: xmlDoc.responseURL},
                    xmlDoc.status, xmlDoc.statusText
                ),0) : fail.call(undefined,
                    { responseText: err ? err : xmlDoc.responseText, responseURL: xmlDoc.responseURL},
                    xmlDoc.status, xmlDoc.statusText
                )): '';
        }
        if(p){
            if(!p.style.width || parseInt(p.style.width) < 100) p.style.width = '100%';
            if(p.classList.contains('prepare')) p.classList.remove('prepare');
            p.classList.add('always');
            setTimeout(()=>{
                if(document.body.contains(p))
                    document.body.removeChild(p);
            },2000);
        }
        always instanceof Function ? (a ? setTimeout(()=>always.call(undefined, xmlDoc.response, xmlDoc.status),0) : always.call(undefined, xmlDoc.response, xmlDoc.status)) : '';
    }
}
function handleError(e,xmlDoc,fail,always){
    fail && fail instanceof Function ? fail.call(undefined,
        { responseText: xmlDoc.responseText, responseURL: xmlDoc.responseURL},
        xmlDoc.status, xmlDoc.statusText
    ) : console.error('ERROR: ',e);
    always instanceof Function ? setTimeout(()=>always.call(undefined, xmlDoc.response, xmlDoc.status),0) : '';
}
function simplify(method, url, data, done, fail, always, progress, async, config){
    let get = method.toLowerCase() === 'get';
    data = get ? parseData(data) : data;                                    if(debug) console.log('Ajax data: %o',data);
    let xmlDoc = getXmlDoc();
    let p = progress ? null : createProgress();
    async = (async !== undefined && async !== null) ? async : true;
    xmlDoc.open(method, url + (get && data ? '?' +data : ''), async);       if(debug) console.log('Ajax url: %s',url + (get && data ? '?' +data : ''));
    if(config && config.json){
        xmlDoc.setRequestHeader("Accept","application/json");
    }
    if(!get) xmlDoc.setRequestHeader("Content-type", "application/json");
    if((authenticate || (config && config.authenticate)) && localStorage.getItem('access_token')){
        xmlDoc.setRequestHeader("Authorization","Bearer "+localStorage.getItem('access_token'));
    }
    if(config && config.headers){
        Object.keys(config.headers).forEach(key => xmlDoc.setRequestHeader(key,config.headers[key]));
    }
    //if(!get){
    //	xmlDoc.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    //}

    xmlDoc.onerror = handleError.bind(this,xmlDoc,fail,always);
    xmlDoc.onreadystatechange = handleStateChange.bind(this, xmlDoc, done, fail, always, p, config, async);
    if(async) xmlDoc.timeout = config ? config.timeout : undefined;
    xmlDoc.ontimeout = handleError.bind(this,xmlDoc,fail,always);
    let progressFunction = progress ? progress : function(e){updateProgress(e,p)};
    xmlDoc.addEventListener("progress", progressFunction);
    get?xmlDoc.send():xmlDoc.send(JSON.stringify(data));
}
function createProgress(){
    let p = document.createElement('div');
    p.className = 'loadAjax prepare';
    document.body.appendChild(p);
    return p;
}
function updateProgress(oEvent,p){
    if(p){
        let width = parseInt((oEvent.loaded / oEvent.total)*100);
        if(p.classList.contains('prepare')) p.classList.remove('prepare');
        p.style.width = width+'%';
        return;
    }
    if(oEvent.lengthComputable){
        let percentComplete = parseInt((oEvent.loaded / oEvent.total)*10000)/100;
        //console.log(percentComplete+"%");
        return percentComplete;
    }
    //console.log("Unable to compute progress information since the total size is unknown");
    return null;
}

const Ajax = {
    get : function(url, data, done, fail, always, progress){
        simplify('GET',url,data,done,fail,always,progress);
    },
    post : function(url, data, done, fail, always, progress){
        simplify('POST',url,data,done,fail,always,progress);
    },
    ajax : function(config){
        if(!config || typeof config !== 'object'){
            throw new Error("Configuration missing or wrong format!");
        }
        if(!config.url){
            throw new Error("No URL supplied.");
        }
        if(config.beforeSend && typeof config.beforeSend === 'function'){
            config.beforeSend.call();
        }
        simplify(config.method?config.method:'GET',config.url,config.data,config.done,config.fail,config.always,config.onProgress,config.async,config);
    },
    fail : function(callback, xhr, code, reason){
        if(callback instanceof Function) {
            console.group(code);
            console.info(xhr.responseText);
            console.error(reason);
            console.groupEnd();
            return callback();
        }else{
            console.group(xhr);
            console.info(callback.responseText);
            console.error(code);
            console.groupEnd();
        }
    },
    setAuthenticate : function(auth){
        authenticate = auth;
    },
    setDebug : function(deb){
        debug = deb;
    }
};

export { Ajax as default }