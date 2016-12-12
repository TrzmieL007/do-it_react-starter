/**
 * Created by trzmiel007 on 30/11/16.
 */

var english = {
    AccessibilityOptions : "Accessibility Options",
    AccessibilityOptions_Colour : "Colour",
    AccessibilityOptions_AdjustingTextSize : "Adjusting the size of text",
    AccessibilityOptions_AdjuctingTextSize_Info : "<span><p>This site uses font sizes that you can control using your browser.</p><p>You can control text size in most modern browsers by holding down the CTRL key and pressing '+' or '-'.</p><ul class=\"list-unstyled\"><li><kbd>CTRL</kbd> + <kbd>+</kbd> Zooms in (makes text bigger)</li><li><kbd>CTRL</kbd> + <kbd>-</kbd> Zooms out (makes text smaller)</li><li><kbd>CTRL</kbd> + <kbd>0</kbd> Default zoom (sets text to default size)</li></ul></span>",

    Welcome : "Welcome"
};
var polish = {
    AccessibilityOptions : "Opcje ułatwiania dostępu",
    AccessibilityOptions_Colour : "Kolor",
    AccessibilityOptions_AdjustingTextSize : "Dopasowywanie rozmiaru tekstu",
    AccessibilityOptions_AdjuctingTextSize_Info : "<span><p>Ta strona używa rozmiarów czcionek, które można kontrolować za pomocą przeglądarki.</p><p>Możesz kontrolować rozmiar czcionki w większości nowych przeglądarek poprzez trzymanie klawisza CTRL i naciskanie klawiszy '+' lub '-'.</p><ul class=\"list-unstyled\"><li><kbd>CTRL</kbd> + <kbd>+</kbd> Powiększenie</li><li><kbd>CTRL</kbd> + <kbd>-</kbd> Zmniejszenie</li><li><kbd>CTRL</kbd> + <kbd>0</kbd> Powrót to normalnej wielkości</li></ul></span>",

    Welcome : "Wilkomen ;P"
};

var translations = {
    en: english,
    pl: polish
};

function cantFindKey(translation){
    return ">>>"+translation+"<<<";
}

module.exports = class Translator {
    constructor(dfltLanguage){
        this.languages = { polish : "pl", english : "en"};
        this.language = this.getLanguageCode(dfltLanguage);
        this.currLang = () => {
            if(!this.language) throw new Error("You have to set the language before you can use default one");
            return this.language;
        }
    }
    getLanguageCode(l){
        var res = null;
        Object.keys(this.languages).some(k => k == l ? (res = this.languages[k],1) : this.languages[k] == l ? (res = l,1) : 0);
        return res;
    }
    getLocaleString(key){
        return translations[this.currLang()][key] || cantFindKey(key);
    }
    getLocalisedString(key,lang){
        return translations[this.getLanguageCode(lang)][key] || cantFindKey(key);
    }
    static toLocaleString(key,lang){
        return translations[lang][key] || cantFindKey(key);
    }
    setDefaultLanguage(lang){
        this.language = this.getLanguageCode(lang);
    }
};
