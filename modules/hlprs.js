/**
 * Created by trzmiel007 on 04/09/16.
 */

var fs = require("fs");
var path = require("path");

module.exports = function(config, logger){
    var hlprs = {};
    var pathPrefix = path.join(__dirname,config.path.join(path.sep));

    Object.keys(config.files).forEach(function(helper){
        try {
            var helperFile = path.resolve(pathPrefix, config.files[helper].fileName);
            if(helperFile){
                hlprs[helper] = require(helperFile)(config.files[helper].params, logger);
            }else{
                logger.log('error','No file for helper '+helper);
            }
        }catch(e){
            logger.log('error','An error occured while creating helper '+helper,e);
        }
    });

    return {
        get : function(name){
            return hlprs[name];
        }
    };
};