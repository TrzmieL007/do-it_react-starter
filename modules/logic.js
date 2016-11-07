/**
 * Created by trzmiel007 on 26/08/16.
 */

var crypto = require('crypto');

module.exports = function(){

    return {
        createResult : function(data){
            return { result: true, content: data };
        },
        random : function(min, max){
            min = min || 0;
            max = max || 32768;
            return Math.floor(Math.random() * (max - min + 1) + min);
        },
        getHash : function(salt){
            var hash = (salt || "5A1T") + Date.now() + this.random();
            return crypto.createHash("md5").update(hash).digest("hex");
        }
    }

};