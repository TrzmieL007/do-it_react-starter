/**
 * Created by trzmiel007 on 26/08/16.
 */

var express = require("express");
var crypto = require('crypto');

module.exports = function(config,logger,logic){
    var router = express.Router();
    var mySQL = logic.dbConnections.getConnector('mySQL');

    router.route('/users').get(function(req,res,next){
        mySQL.get({
            table : 'Users',
            executor : req.user || req._remoteAddress
        }).then(function(data){
            return res.json(logic.createResult(data));
        }, function(errorObj){
            console.log('rejected');
            logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
            next(505);
        }).catch(function(ex){
            next({ status: 500, message: "Exception thrown in wojtech/user GET", error: ex });
        });
    }).put(function(req,res,next){
        var data = {
            login : req.body.login,
            password : crypto.createHmac('sha256',req.body.password).digest('hex'),
            user_type : 0
        };
        mySQL.insert({
            table : 'Users',
            data : data,
            executor : req.user || req._remoteAddress
        }).then(function(id){
            return res.json(logic.createResult("Last inserted ID = "+id));
        }, function(errorObj){
            logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
            next({ status: 500, message: errorObj.message, error: errorObj.error });
        }).catch(function(ex){
            next({ status: 500, message: "Exception thrown in wojtech/user PUT", error: ex });
        });
    }).post(function(req,res,next){
        var data = {
            login : req.body.login,
            user_type : req.body.user_type
        };
        if(req.body.password) data.password = crypto.createHmac('sha256',req.body.password).digest('hex');
        mySQL.update({
            table : 'Users',
            data : data,
            where : { Id: req.body.id },
            executor : req.user || req._remoteAddress
        }).then(function(changed){
            return res.json(logic.createResult("Number of rows chaged by this query = "+changed));
        }, function(errorObj){
            logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
            next({ status: 500, message: errorObj.message, error: errorObj.error });
        }).catch(function(){
            next({ status: 500, message: "Exception thrown in wojtech/user POST", error: arguments });
        });
    }).delete(function(req,res,next){
        mySQL.delete({
            table : 'Users',
            where : { Id : req.body.id },
            executor : req.user || req._remoteAddress
        }).then(function(affected){
            return res.json(logic.createResult("Number of rows affected by this query = "+affected));
        }, function(errorObj){
            logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
            next({ status: 500, message: errorObj.message, error: errorObj.error });
        }).catch(function(){
            next({ status: 500, message: "Exception thrown in wojtech/user DELETE", error: arguments });
        });
    });

    return router;
};