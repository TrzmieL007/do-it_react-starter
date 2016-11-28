/**
 * Created by trzmiel007 on 22/08/16.
 */

var express = require('express');
var bodyParser = require('body-parser');
var winston = require('winston-request-logger');
var path = require('path');
var compression = require('compression');

module.exports = function(appConfig,logger){
    var config = appConfig.get('app');
    var app = express();

    app.use(compression());
    // app.use(express.favicon(config.favicon));
    app.use('/', express.static(path.join(__dirname, '..', config.staticFiles)));
    app.use(winston.create(logger));
    app.use(require('cookie-parser')());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(require('express-session')({
        // genid: function(req){ return +(new Date())+String.fromCharCode(Math.random()*(126-33)+32)+Math.random()*1024; },
        secret: 's',
        cookie:{maxAge:3600000},
        resave: false,
        saveUninitialized: false
    }));
    app.use(require('express-useragent').express());
    app.use(require('morgan')('dev'));
    app.use(require('connect-busboy')());

    return {
        app: app,
        config: config,
        logger: logger
    };
};