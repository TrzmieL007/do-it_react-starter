/**
 * Created by trzmiel007 on 22/08/16.
 */

var https = require('https');
var http = require('http');
var path = require('path');
var fs = require('fs');

module.exports = function(config, application){
    var server;
    var secureServer;
    var logServer;
    var app = application.app;
    var logger = application.logger;
    var onError = function(error){
        if(error.syscall != 'listen') throw error;
        switch(error.code){
            case 'EADDRINUSE':
                logger.error(config.host + ":" + config.port + " is already in use");
                process.exit(1);
                break;
            case 'EACCES':
                logger.error(config.host + ":" + config.port + " requires special privileges");
                process.exit(1);
                break;
            default:
                throw error;
        }
    };

    if(config.enableHTTP){
        logger.debug("Starting HTTP Server on "+config.host+":"+config.port);
        server = http.createServer(app).listen(config.port,config.host).on('error',onError);
    }
    if(config.enableHTTPS){
        logger.debug("Starting HTTPS Server on "+config.host+":"+config.sslPort);
        secureServer = https.createServer({
            key: fs.readFileSync(path.resolve(__dirname,'..','server_certificates',config.sslKey),'utf8'),
            cert: fs.readFileSync(path.resolve(__dirname,'..','server_certificates',config.sslCert),'utf8')
        },app).listen(config.sslPort,config.host).on('error',onError);
    }
    if(!config.enableHTTP && !config.enableHTTPS){
        logger.error('HTTP and HTTPS servers are disabled, enable any to run server.');
    }
    if(config.logServer.enable){
        logServer = http.createServer(require(path.resolve(__dirname,'logServer')))
            .listen(config.logServer.port, config.logServer.host);
        logger.debug("Log server has started on "+config.logServer.host+":"+config.logServer.port);
    }

    return {
        http : server,
        https : secureServer,
        logServer : logServer,
        app : app
    }
};