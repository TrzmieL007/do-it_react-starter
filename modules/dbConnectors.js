/**
 * Created by trzmiel007 on 25/08/16.
 */

var path = require("path");

module.exports = function(config, logger){
    var cConfig = config.get('dbConnectors');
    var dConfig = config.get('databases');
    return {
        connectors : Object.keys(cConfig).reduce(function(p,c){
            if(cConfig[c].active){
                var file = path.join(__dirname, 'connectors', cConfig[c].file);
                p[c] = require(file)(dConfig[c][dConfig.mode], logger, cConfig[c].params);
            }
            return p;
        },{}),
        getConnector : function(name){
            return this.connectors[name];
        },
        getConectionPool : function(name){
            return this.connectors[name].getConnectionPool();
        },
        getConnection : function(name){
            return this.connectors[name].getConnection();
        }
    };
};