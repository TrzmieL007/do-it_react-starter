/**
 * Created by trzmiel007 on 22/08/16.
 */
var path = require('path');
var winston = require('winston');

var getDate = function(){
    return new Date().toJSON().substr(0,10);
};

var getTimestamp = function(){
    return new Date().toJSON().replace(/(T)|(Z$)/g," ").trim();
};

var consoleFormatter = function(data,level){
    return data
        ? getTimestamp() + ' ' + (level || data.level.toUpperCase()) + ': ' + (data.message || '')
        + (data.meta && Object.keys(data.meta).length ?
                '\n\t' + JSON.stringify(data.meta,null,4).substr(0,(data.level === 'error') ? 55555 : 333)
                : '')
        : null;
};

var reportFormatter = function(data){
    if(!data) return null;
    var color;
    switch(data.level.toLowerCase()){
        case "error": color = "[31m"; break;
        case "debug": color = "[34m"; break;
        case "verbose": color = "[36m"; break;
    }
    return consoleFormatter(data, (color || '') + data.level.toUpperCase() + (color ? "[39m" : ''));
};

var voidLogger = {
    selectLogFile: function(){ return true; },
    debug: function(){ return true; },
    verbose: function(){ return true; },
    info: function(){ return true; },
    error: function(){ return true; },
};

var mySQLFormatter = function(data){
    if(!data) return null;
    var color;
    switch(data.level.toLowerCase()){
        case "error": color = "[31m"; break;
        case "info": color = "[36m"; break;
    }
    return consoleFormatter(data, (color || '') + data.level.toUpperCase() + (color ? "[39m" : ''));
};

module.exports = function(config){
    var logger;
    if(config.enabled){
        logger = new winston.Logger({
            transports: [
                new (require('winston-daily-rotate-file'))({
                    name: 'debug',
                    level: config.fileLevel,
                    filename: path.join(__dirname,'..','logs',config.filename),
                    formatter: reportFormatter,
                    timestamp: getTimestamp,
                    json: false,
                    silent: false,
                    colorize: true,
                    eol: "\n",
                    datePattern: config.datePattern
                }),
                new winston.transports.Console({
                    handleExceptions: config.consoleErrors,
                    formatter: consoleFormatter,
                    level: config.consoleLevel,
                    json: false,
                    colorize: true
                })
            ],
            exceptionHandlers: [
                new winston.transports.File({
                    filename: path.join(__dirname,'..','logs', config.exceptionFileName + getDate() + '.log'),
                    formatter: reportFormatter,
                    timestamp: getTimestamp,
                    eol: "\n",
                    json: false,
                    colorize: true,
                    rotationFormat: config.datePattern
                })
            ],
            exitOnError: false
        });
        logger.setLogFile = function(){
            this.exceptionHandlers.file.filename = config.exceptionFileName + getDate() + '.log';
            this.exceptionHandlers.file._basename = config.exceptionFileName + getDate() + '.log';
        };
        if(config.mySQL && config.mySQL.enabled) {
            logger.mySQLlogger = new winston.Logger({
                transports: [
                    new (require('winston-daily-rotate-file'))({
                        name: 'mySql',
                        level: 'info',
                        filename: path.join(__dirname, '..', 'logs', config.mySQL.filename),
                        formatter: mySQLFormatter,
                        timestamp: getTimestamp,
                        json: false,
                        silent: false,
                        colorize: true,
                        eol: "\n",
                        datePattern: config.mySQL.datePattern
                    })
                ],
                exitOnError: false
            });
        }else{
            logger.mySQLlogger = voidLogger;
        }
    }else{
        logger = voidLogger;
    }
    return logger;
};