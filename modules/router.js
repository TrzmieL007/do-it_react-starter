/**
 * Created by trzmiel007 on 26/08/16.
 */

var path = require("path");

module.exports = function(config, logger, app, logic){

    // set sessionId
    app.use(function(req, res, next){
        req.sesId = req.cookies['connect.sid'];
        res.status(200);
        if(!req.sesId){
            req.sesId = req.sessionID || logic.getHash();
            res.cookie('connect.sid',req.sesId, { maxAge: 3600000 });
        }
        next();
    });

    app.all('/ws', function (req, res, next) {
        if(req.method.toLowerCase() !== 'post' && req.method.toLowerCase() !== 'get') return next(404);
        return res.json({result: logic.webSocket.sendMessageToEverybody(req.method.toLowerCase() == 'get' ? req.query : req.body)});
    });

    Object.keys(config.routes).forEach(function(route){
        var filePath = path.resolve(__dirname,'..',config.routesDir,config.routes[route].file);
        app.use(config.prefix + route, require(filePath)(config.routes[route].params,logger,logic));
    });

    // 404 handler
    app.use(function(req, res, next){
        next(404)
    });

    // error handler
    app.use(function(error, req, res, next){
        if(error == 404){
            error = {
                status : 404,
                message : "Incorrect address"
            };
        }else{
            logger.log('error', error, req.sesId || req.query.customerId || '');
        }
        var resObj = {
            result: false,
            content: error.message
        };
        if(process.env.DEBUG || (req.query && req.query.debug)){
            resObj.error = error;
        }
        res.status(error.status || 500);
        res.json(resObj);
    });
};