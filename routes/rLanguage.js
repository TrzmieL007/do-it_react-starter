/**
 * Created by trzmiel007 on 04/09/16.
 */

var express = require("express");
var path = require("path");
var fs = require("fs");

module.exports = function(config,logger,logic){
    var router = express.Router();
    var files = logic.dbConnections.getConnector('static');

    router.route('/R').all(function(req,res,next){
        if(logic.webSocket.hasClientRegistered(req.sesId)){
            next();
        }else{
            next({ status: 403, message: 'User not registered to the WebSockets, can\'t receive live console feed. Please refresh connection.' })
        }
    }).get(function(req,res,next){
        var rExecutor = logic.executors.get('R');
        var x = req.query.x;
        var func = req.query.f;
        var result = func+'('+x+')';
        res.set({'Content-Type' : 'text/html'});
        rExecutor.executeRcommands(result).then(function(d){
            if(d.stdout) {
                result += ' evaluated to<br><pre>' + d.stdout + '</pre><br/>';
            }else{
                result += ' did not produce any output<br/>'
            }
            if(d.stderr){
                result += '<div style="color:red;">Evaluation ended with errors:<br><pre>'+d.stderr+'</pre></div>';
            }
            return res.end('<html><body>'+result+'</body></html>');
        },function(d){
            result += ' evaluation ended up with error code '+d.code+' :(<br>';
            if(d.stdout){
                result += 'It produced output `' + d.stdout + '`<br/>';
            }
            if(d.stderr){
                result += '<div style="color:red;">Evaluation ended with errors:<br><pre>'+d.stderr+'</pre></div>';
            }
            return res.end('<html><body>'+result+'</body></html>');
        });
    }).post(function(req,res,next){
        var command;
        if(req.body.filename){
            var filePath = files.exists({ path : path.join(config.dbPath.join(path.sep),req.body.filename), sync : 1 });
            command = filePath + (req.body.arguments ? ' '+req.body.arguments : '');
        }else{
            command = req.body.command;
        }
        logic.executors.get('R').executeR(command,req.sesId).then(function(r){
            var execPath = logic.executors.get('R').getExecutionPath();
            var result = function(other){
                other = other.hasOwnProperty('additionalData') ? other.additionalData : {};
                return res.json(logic.createResult(Object.assign({},r,other)));
            };
            files.get({ path : execPath }).then(function(files){
                var add;
                console.log(files);
                if(files.length){
                    add = { additionalData : { filesProuced : files.reduce(function(p,c){
                        p.push({ filename: c, content: fs.readFileSync(path.resolve(execPath,c),'base64') });
                        fs.unlinkSync(path.resolve(execPath,c));
                        return p;
                    },[]) } };
                }
                result(add);
            },result).catch(result);
        },function(e){
            e.status = 500;
            next(e);
        }).catch(function(ex){
            logger.log('error','Exception thrown in rExecutor on executeR method', ex);
            next({ status: 500, message: ex });
        });
    }).put(function(req, res, next){
        console.log('put');
        var savePath;
        var fname;
        var error;
        req.busboy.on('file',function(fieldname, file, filename, encoding, mimetype){
            fname = filename;
            if(filename.match(/^[a-zA-Z0-9_].*\.R$/)) {
                savePath = path.join(files.getDbPath(),config.dbPath.join(path.sep), filename);
                if(files.exists({ path : path.join(config.dbPath.join(path.sep), filename), sync : true })){
                    next(error = { status : 406, message : { message: 'file already exists', fname: fname } });
                }else{
                    file.pipe(fs.createWriteStream(savePath));
                }
            }else{
                next(error = { status : 406, message : { message: 'File is not Rscript file, or have wrong extension.', fname: fname} });
            }
        });
        req.busboy.on('finish',function(){
            if(error){
                next(error);
            }else{
                res.json(logic.createResult({
                    savePath: savePath,
                    filename: fname
                }));
            }
        });
        req.pipe(req.busboy);
    });

    router.route('/rScript').get(function(req,res,next){
        res.set({'Content-Type' : 'text/html'});
        if(req.query.file){
            files.get({
                path : path.join(config.dbPath.join(path.sep),req.query.file),
                json : false
            }).then(function(result){
                var options = result.replace(/^#!\s[^\s]+\s--vanilla(\s.*\n)?((.*\n)*)## End$/,"$1").trim();
                var content = result.replace(/^#!\s[^\s]+\s--vanilla(\s.*\n)?((.*\n)*)## End$/,"$2").replace(/\n$/,'');
                return res.end(logic.helpers.get("templates").getTemplate("rScripts", {
                    FileName: '<input id="RScriptName" placeholder="TempScriptName-' +
                        (+(new Date())) + '" value="'+req.query.file+'" style="width:100%;" readonly />',
                    RScriptPath: config.rBinPath + 'Rscript',
                    RScriptOptions: '<input type="text" id="RScriptOptions" value="' + options
                    + '" placeholder="<Script options eg. --default-packages=utils>" style="width:100%;" />',
                    Script: '<textarea id="ScriptContent" autofocus placeholder="Script content goes here">'+content+'</textarea>',
                    Buttons: '<button id="UpdateScript">Update R script</button>'
                }));
            },function(errorObj){
                logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
                next({ status: 500, message: errorObj.message, error: errorObj.error });
            }).catch(function(ex){
                next({ status: 500, message: "Exception thrown in R/rScript GET", error: ex });
            });
        }else{
            return res.end(logic.helpers.get("templates").getTemplate("rScripts", {
                FileName: '<input id="RScriptName" placeholder="TempScriptName-' + (+(new Date())) + '" style="width:100%;" />',
                RScriptPath: config.rBinPath + 'Rscript',
                RScriptOptions: '<input type="text" id="RScriptOptions" value="'
                + (req.query.options ? decodeURIComponent(req.query.options) : '')
                + '" placeholder="<Script options eg. --default-packages=utils>" style="width:100%;" />',
                Script: '<textarea id="ScriptContent" autofocus placeholder="Script content goes here"></textarea>',
                Buttons: '<button id="GenScript">Generate R script</button>'
            }));
        }
    }).post(function(req,res,next){
        var content = '#! '+config.rBinPath+'Rscript --vanilla '+req.body.options+"\n"+req.body.content+"\n## End";
        var fileName = req.body.fileName;
        files.update({
            path : path.join(config.dbPath.join(path.sep),fileName),
            content : content,
            json : false
        }).then(function(result){
            return res.json(logic.createResult(result));
        }, function(errorObj){
            logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
            next({ status: 500, message: errorObj.message, error: errorObj.error });
        }).catch(function(ex){
            next({ status: 500, message: "Exception thrown in R/rScript PUT", error: ex });
        });
    }).put(function(req,res,next){
        var content = '#! '+config.rBinPath+'Rscript --vanilla '+req.body.options+"\n"+req.body.content+"\n## End";
        var fileName = req.body.fileName.replace(/\s/g,"_");
        if(!fileName.match(/.+\.R$/)) fileName += '.R';
        files.insert({
            path : path.join(config.dbPath.join(path.sep),fileName),
            content : content,
            json : false
        }).then(function(result){
            return res.json(logic.createResult(result));
        }, function(errorObj){
            logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
            next({ status: 500, message: errorObj.message, error: errorObj.error });
        }).catch(function(ex){
            next({ status: 500, message: "Exception thrown in R/rScript PUT", error: ex });
        });
    }).delete(function(req,res,next){
        files.delete({ path : path.join(config.dbPath.join(path.sep),req.body.fileName) }).then(function(result){
            return res.json(logic.createResult(result));
        }, function(errorObj){
            logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
            next({ status: 500, message: errorObj.message, error: errorObj.error });
        }).catch(function(ex){
            next({ status: 500, message: "Exception thrown in R/rScript DELETE", error: ex });
        });
    });

    router.route('/rScriptsBrowser').get(function(req,res,next){
        files.get({ path : config.dbPath.join(path.sep) }).then(function(result){
            res.set({'Content-Type' : 'text/html'});
            var fls = result.reduce(function(p,file){
                return p+"<li data-fname='"+file+"'>"+file+"</li>\n";
            },"");
            if(req.query.file){
                files.get({
                    path : path.join(config.dbPath.join(path.sep),req.query.file),
                    json : false
                }).then(function(content){
                    return res.end(logic.helpers.get("templates").getTemplate("rScriptBrowser", {
                        FileList : fls,
                        FileContent : content
                    }));
                },function(errObj){
                    return res.end(logic.helpers.get("templates").getTemplate("rScriptBrowser", {
                        FileList: fls,
                        FileContent : JSON.stringify(errObj,null,4)
                    }));
                }).catch(function(ex){
                    return res.end(logic.helpers.get("templates").getTemplate("rScriptBrowser", {
                        FileList: fls,
                        FileContent : JSON.stringify(errObj,null,4)
                    }));
                });
            }else{
                return res.end(logic.helpers.get("templates").getTemplate("rScriptBrowser", {
                    FileList: fls
                }));
            }
        },function(errorObj){
            logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
            next({ status: 500, message: errorObj.message, error: errorObj.error });
        }).catch(function(ex){
            next({ status: 500, message: "Exception thrown in R/rScriptsBrowser GET", error: ex });
        });
    }).post(function(req,res,next){
        if(!req.body.filename){
            return res.json({ result: false, content: "No filename passed" });
        }
        files.get({
            path: path.join(config.dbPath.join(path.sep),req.body.filename),
            json: false
        }).then(function(content){
            return res.json(logic.createResult(content));
        },function(errorObj){
            logger.log('error',errorObj.code+' - '+errorObj.message,errorObj.error);
            next({ status: 500, message: errorObj.message, error: errorObj.error });
        }).catch(function(ex){
            next({ status: 500, message: "Exception thrown in R/rScriptsBrowser GET", error: ex });
        });
    });

    return router;
};