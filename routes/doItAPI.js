/**
 * Created by trzmiel007 on 28/11/16.
 */
/**
 * Created by trzmiel007 on 04/09/16.
 */
'use strict';
const express = require("express");
const path = require("path");
const fs = require("fs");

module.exports = function(config,logger,logic){
    const router = express.Router();
    const files = logic.dbConnections.getConnector('static');

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
    router.route('/assessments').get(function(req,res,next){
        if((req.query.clientCode || req.query.clientId)){
            files.get({path : path.join(config.dbPath.join(path.sep),"assessments.json")}).then(function(result){
                let assessments;
                if(req.query.clientCode && result[req.query.clientCode])
                    assessments = result[req.query.clientCode];
                else if(req.query.clientId && result[req.query.clientId] && result[result[req.query.clientId]])
                    assessments = result[result[req.query.clientId]];
                if(assessments){
                    let ids;
                    return res.json(req.query.id ? (ids = req.query.id.split(','),Object.keys(assessments).reduce((p,key)=>(ids.indexOf(key)>-1?(p[key]=assessments[key],p):p),{})) : assessments);
                }else
                    next({ status: 404, message: "No client found with "+(req.query.clientCode?"clientCode: "+req.query.clientCode:"")+(req.query.clientId?"clientId: "+req.query.clientId:"") });
            },function(errorObj){
                logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
                next({ status: 500, message: errorObj.message, error: errorObj.error });
            }).catch(function(ex){
                next({ status: 500, message: "Exception thrown in /doItAPI/assessment GET", error: ex });
            });
        }else{
            next({ status: 404, message: "clientCode and clientId parameters missing. Use one to get the data." });
        }
    });

    return router;
};


/* modules: [ { icon -> iconFontName + iconFontSize, name -> Title.replace(/\([IDS]+[0-9]+\)$/, "") ,id -> Id } ] */