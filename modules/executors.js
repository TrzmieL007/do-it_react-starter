/**
 * Created by trzmiel007 on 30/08/16.
 */

var path = require("path");

module.exports = function(config,logger,logic){
    var executors = {};
    var pathPrefix = path.join(__dirname,(Array.isArray(config.executorsFolder) ? config.executorsFolder.join(path.sep) : config.executorsFolder));
    Object.keys(config.executors).forEach(function(name){
        try{
            var fp = path.resolve(pathPrefix,config.executors[name].fileName);
            executors[name] = require(fp)(config.executors[name].params,logger,logic);
        }catch(e){
            logger.log('error','Creating executor named: '+name+' failed.',e);
        }
    });

    return {
        get : function(name){ return executors[name]; }
    }
};