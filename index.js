/**
 * Created by trzmiel007 on 16/08/16.
 */

var CPUs = 1;//require("os").cpus().length - 1 || 1;
var cluster = require("cluster");
process.env.UV_THREADPOOL_SIZE = 10;

try{
    // Load main config module
    var appConfig = require("./modules/configManager")();
    // Load logger
    var logger = require("./modules/logger")(appConfig.get("logger"));

    if(cluster.isMaster){
        for(var i = 0; i < CPUs; ++i){
            cluster.fork();
        }
        cluster
            .on("listening", function(worker, addr){
                logger.debug("worker "+worker.id+" with pID: "+worker.process.pid+", listening on "+addr.address+":"+addr.port);
            })
            .on("disconnect", function(worker){
                logger.debug("worker "+worker.id+" just died ;(");
                cluster.fork();
            });
    }else{
        logger.debug("Worker "+cluster.worker.id+" started initializing application");

        // create express app instance
        var app = require("./modules/app")(appConfig,logger);
        // start HTTP Server
        var httpServer = require("./modules/httpServer")(appConfig.get('httpServer'),app);
        // create class with logic for use in the app
        var logic = require("./modules/logic")();
        // create connector objects to databases
        logic.dbConnections = require("./modules/dbConnectors")(appConfig,logger);
        // webSocket connection manager
        logic.webSocket = require("./modules/webSockets")(appConfig.get('webSockets'), logger, httpServer);
        // create helpers
        logic.helpers = require("./modules/hlprs")(appConfig.get('heplers'),logger);
        // create executors
        logic.executors = require("./modules/executors")(appConfig.get("executors"),logger,logic);
        // initialize routes
        require("./modules/router")(appConfig.get('routes'),logger,app.app,logic);

        logger.debug("Worker "+cluster.worker.id+" has just finished initializing the app :)");
    }
}catch(e){
    console.trace(e.stack);
}

/*
const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const packageJSON = require('./package.json');
const PROD = process.env.PROD || 1;
const PORT = process.env.PORT || 8080;

app.use(require('morgan')('dev'));

app.use('/', express.static(path.join(__dirname, 'statics')));

app.get('/', function(req,res){
    res.set('Content-Type', 'text/html');
    res.send('<h1>Hello World!</h1>').end();
});

app.listen(PORT, function(){
    console.log('Express server listening on port '+PORT);
});*/
