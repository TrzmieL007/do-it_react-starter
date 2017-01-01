/**
 * Created by trzmiel007 on 21/12/16.
 */
import React from 'react';
import Audio from '../Views/Components/audio';

let propNamesMap = {
    "class" : "className",
    "acceptcharset" : "acceptCharset",
    "accesskey" : "accessKey",
    "allowfullscreen" : "allowFullScreen",
    "autocomplete" : "autoComplete",
    "autofocus" : "autoFocus",
    "autoplay" : "autoPlay",
    "cellpadding" : "cellPadding",
    "cellspacing" : "cellSpacing",
    "charset" : "charSet",
    "classid" : "classID",
    "colspan" : "colSpan",
    "contenteditable" : "contentEditable",
    "contextmenu" : "contextMenu",
    "crossorigin" : "crossOrigin",
    "datetime" : "dateTime",
    "enctype" : "encType",
    "formaction" : "formAction",
    "formenctype" : "formEncType",
    "formmethod" : "formMethod",
    "formnovalidate" : "formNoValidate",
    "formtarget" : "formTarget",
    "frameborder" : "frameBorder",
    "hreflang" : "hrefLang",
    "for" : "htmlFor",
    "httpequiv" : "httpEquiv",
    "inputmode" : "inputMode",
    "keyparams" : "keyParams",
    "keytype" : "keyType",
    "marginheight" : "marginHeight",
    "marginwidth" : "marginWidth",
    "maxlength" : "maxLength",
    "mediagroup" : "mediaGroup",
    "minlength" : "minLength",
    "novalidate" : "noValidate",
    "radiogroup" : "radioGroup",
    "readonly" : "readOnly",
    "rowspan" : "rowSpan",
    "spellcheck" : "spellCheck",
    "srcdoc" : "srcDoc",
    "srclang" : "srcLang",
    "srcset" : "srcSet",
    "tabindex" : "tabIndex",
    "usemap" : "useMap"
};

function translatePropNames(props) {
    return Object.keys(props).reduce((p, c) => {
        if(propNamesMap.hasOwnProperty(c.toLowerCase())) p[propNamesMap[c.toLowerCase()]] = props[c];
        else p[c] = props[c];
        return p;
    }, {});
}
function transformTag(tag,key){
    switch(tag.tag){
        case 'a':
            if(tag.properties && tag.properties.href && tag.properties.href.match(/\.[mp3og]{3}$/)){
                return {
                    tag : Audio,
                    properties : { src : tag.properties.href, props : tag.properties.title, key }
                };
            }
            return tag;
        default:
            return tag;
    }
}

export default function ParseHTMLToReact(t){
    let getParams = s => s.replace(/(^[a-z]+\s)(.*$)/,"$2").match(/([a-z]+)=\"([^"]+)\"\s?/gi).reduce((p,k)=>(p[k.split('=')[0]]=k.split('=')[1].replace(/"\s?/g,''),p),{});
    let ary = t.split('<').map((k,i,a) => {
        if(k){
            let tag = k.split('>')[0];
            let content = k.split('>')[1] || null;
            if(tag == '/a' && a[i-1].match(/href=\"https?.+\.[mp3og]{3}\"/)) content = content.trim(); // This is a hack, but it works ;P
            return [tag.match(/^\/[a-z]+/i)?tag:[tag.split(' ')[0], tag.match(/\s/g) ? getParams(tag) : null, tag.match(/\/$/)], content && !content.match(/^[\s\n\r]*$/) ? {content: content} : null];
        }
        return null;
    }).reduce((p, a) => {
        if (a == null) return p;
        if (Array.isArray(a)) a.forEach(e => e ? p.push(e) : null);
        return p;
    }, []);
    let simplify = (s,d,z)=>{
        z = z || 0;
        for(let i = 0; i < s.length; ++i){
            let c = s[i];
            if(c.hasOwnProperty('content')){
                d.push(c.content);
            }else if(Array.isArray(c)){
                let key = z+'.'+i;
                let obj = { tag : c.shift().replace(/\/$/,''), properties : Object.assign({ key },c[0]?translatePropNames(c[0]):{}) };
                if(!c[1]) obj.content = simplify(s.slice(i+1,s.indexOf('/'+obj.tag,i)),[],key);
                d.push(transformTag(obj,key));
                if(!c[1]) i = s.indexOf('/'+obj.tag,i);
            }
        }
        return d;
    };
    let out = [];
    simplify(ary,out);
    let reactify = e => {
        if(!e) return null;
        if(e && e.tag) return React.createElement(e.tag, e.properties, reactify(e.content));
        if (Array.isArray(e))
            return e.map(c => (c.tag ? React.createElement(c.tag, c.properties, reactify(c.content)) : c));
    };
    return out.length > 1 ? out.map(reactify) : reactify(out[0]);
    // return out;
}

/*
import Audio from '../Views/Components/audio';
import React from 'react';

class Reactify extends React.Component {
    constructor(props) {
        super(props);
        this.propNamesMap = {
            "class" : "className",
            "acceptcharset" : "acceptCharset",
            "accesskey" : "accessKey",
            "allowfullscreen" : "allowFullScreen",
            "autocomplete" : "autoComplete",
            "autofocus" : "autoFocus",
            "autoplay" : "autoPlay",
            "cellpadding" : "cellPadding",
            "cellspacing" : "cellSpacing",
            "charset" : "charSet",
            "classid" : "classID",
            "colspan" : "colSpan",
            "contenteditable" : "contentEditable",
            "contextmenu" : "contextMenu",
            "crossorigin" : "crossOrigin",
            "datetime" : "dateTime",
            "enctype" : "encType",
            "formaction" : "formAction",
            "formenctype" : "formEncType",
            "formmethod" : "formMethod",
            "formnovalidate" : "formNoValidate",
            "formtarget" : "formTarget",
            "frameborder" : "frameBorder",
            "hreflang" : "hrefLang",
            "for" : "htmlFor",
            "httpequiv" : "httpEquiv",
            "inputmode" : "inputMode",
            "keyparams" : "keyParams",
            "keytype" : "keyType",
            "marginheight" : "marginHeight",
            "marginwidth" : "marginWidth",
            "maxlength" : "maxLength",
            "mediagroup" : "mediaGroup",
            "minlength" : "minLength",
            "novalidate" : "noValidate",
            "radiogroup" : "radioGroup",
            "readonly" : "readOnly",
            "rowspan" : "rowSpan",
            "spellcheck" : "spellCheck",
            "srcdoc" : "srcDoc",
            "srclang" : "srcLang",
            "srcset" : "srcSet",
            "tabindex" : "tabIndex",
            "usemap" : "useMap"
        };
    }

    translatePropNames(props) {
        return Object.keys(props).reduce((p, c) => {
            if (this.propNamesMap.hasOwnProperty(c.toLowerCase())) p[this.propNamesMap[c.toLowerCase()]] = props[c];
            else p[c] = props[c];
            return p;
        }, {});
    }
    ParseHTMLToReact(t) {
        t = t || JSON.parse(decodeURIComponent(atob(localStorage.getItem('clientData')))).IntroductionText.replace(/\n/, "<br/>");
        console.log(t);

        return out;
    }


    render() {
        let t = this.props.htmlString;
        let getParams = s => s.replace(/(^[a-z]+\s)(.*$)/,"$2").match(/([a-z]+)=\"([^"]+)\"\s?/gi).reduce((p,k)=>(p[k.split('=')[0]]=k.split('=')[1].replace(/"\s?/g,''),p),{});
        let ary = t.split('<').map(k => {
            if(k){
                let tag = k.split('>')[0];
                let content = k.split('>')[1] || null;
                return [tag.match(/^\/[a-z]+/i)?tag:[tag.split(' ')[0], tag.match(/\s/g) ? getParams(tag) : null, tag.match(/\/$/)], content && !content.match(/^[\s\n\r]*$/) ? {content: content} : null];
            }
            return null;
        }).reduce((p, a) => {
            if (a == null) return p;
            if (Array.isArray(a)) a.forEach(e => e ? p.push(e) : null);
            return p;
        }, []);
        let simplify = (s,d,z)=>{
            z = z || 0;
            for(let i = 0; i < s.length; ++i){
                let c = s[i];
                if(c.hasOwnProperty('content')){
                    d.push(c.content);
                }else if(Array.isArray(c)){
                    let key = z+'.'+i;
                    let obj = { tag : c.shift(), properties : Object.assign({ key },c[0]?this.translatePropNames(c[0]):{}) };
                    if(!c[1]) obj.content = simplify(s.slice(i+1,s.indexOf('/'+obj.tag,i)),[],key);
                    if(obj.properties && obj.properties.href && obj.properties.href.match(/\.[mp3og]{3}$/)){
                        d.push({
                            tag : Audio,
                            properties : { src : obj.properties.href, props : obj.properties.title, key }
                        })
                    }else {
                        d.push(obj);
                    }
                    if(!c[1]) i = s.indexOf('/'+obj.tag,i);
                }
            }
            return d;
        };
        let out = [];
        simplify(ary,out);
        let reactify = e => {
            if (e && e.tag)
                return React.createElement(e.tag, e.properties, reactify(e.content));
            else if (Array.isArray(e))
                return e.map(a => (a.tag ? React.createElement(a.tag, a.properties, reactify(a.content)) : a));
        };
        return out.length > 1 ? <span>{out.map(reactify)}</span> : reactify(out[0]);
    }
}

Reactify.propTypes = {
    htmlString: React.PropTypes.string.isRequired
};

/!* Uncoment this line for use with import keyword *!/
//export default Reactify;
/!* Uncoment this line for use with require(...) function *!/
module.exports = Reactify;
*/
