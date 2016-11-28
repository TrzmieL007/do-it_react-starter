/**
 * Created by trzmiel007 on 28/11/16.
 */
/**
 * Created by trzmiel007 on 04/09/16.
 */

var express = require("express");
var path = require("path");
var fs = require("fs");

module.exports = function(config,logger,logic){
    var router = express.Router();
    var files = logic.dbConnections.getConnector('static');

    router.route('/modules').get(function(req,res,next){
        if(req.query.id && req.query.clientCode){
            files.get({path : path.join(config.dbPath.join(path.sep),"modules.json")}).then(function(result){
                if(result[req.query.clientCode] && result[req.query.clientCode][req.query.id])
                    return res.json(result[req.query.clientCode][req.query.id]);
                next({ status: 404, message: "id or/and clientCode parameter/s incorrect. Cant find appropriate module." });
            },function(errorObj){
                logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
                next({ status: 500, message: errorObj.message, error: errorObj.error });
            }).catch(function(ex){
                next({ status: 500, message: "Exception thrown in /doItAPI/modules GET", error: ex });
            });
        }else{
            next({ status: 404, message: "id or/and clientCode parameter/s missing." });
        }
    });
    router.route('/modulesList').get(function(req,res,next){
        if(req.query.clientCode){
            files.get({path : path.join(config.dbPath.join(path.sep),"modulesList.json")}).then(function(result){
                if(result[req.query.clientCode])
                    return res.json(result[req.query.clientCode]);
                next({ status: 404, message: "No client found with clientCode: "+req.query.clientCode });
            },function(errorObj){
                logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
                next({ status: 500, message: errorObj.message, error: errorObj.error });
            }).catch(function(ex){
                next({ status: 500, message: "Exception thrown in /doItAPI/modulesList GET", error: ex });
            });
        }else{
            next({ status: 404, message: "ClientCode parameter missing." });
        }
    });

    return router;
};