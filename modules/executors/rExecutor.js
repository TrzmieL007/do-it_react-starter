/**
 * Created by trzmiel007 on 30/08/16.
 */

var spawn = require('child_process').spawn;
var path = require("path");

module.exports = function(params, logger, logic){
    var executePath = path.join(__dirname,params.executePath.join(path.sep));
    return {
        executeRcommands : function(commands){
            var args = [];
            if(Array.isArray(commands)){
                for(var i = 0; i < commands.length; ++i){
                    args.push('-e');
                    args.push('"'+commands[i].replace(/#.*\n/g,"").replace(/(\n)+/g,";")+'"');
                }
            }else{
                for(var i = 0; i < arguments.length; ++i){
                    args.push('-e');
                    args.push('"'+arguments[i].replace(/#.*\n/g,"").replace(/(\n)+/g,";").replace(/"/g,'\\"')+'"');
                }
            }
            var exec = 'Executing: Rscript '+args.join(' ')+"\n";
            return new Promise(function(resolve,reject){
                var r = spawn('Rscript',args,{ cwd : executePath });
                var out;
                var err;
                r.stdout.on('data', (data) => {
                    out = (out ? out : '') + data.toString();
                });
                r.stderr.on('data', (data) => {
                    err = (err ? err : '') + data.toString();
                });
                r.on('close', (code) => {
                    switch(code){
                        case 0: return resolve({ stdout: out, stderr: err, executed: exec });
                        default: return reject({ stdout: out, stderr: err, code: code, executed: exec });
                    }
                });
            });
        },
        executeR : function(command,clientId){
            var args = ["--verbose"];
            if(command.match(/.+\.R(\s.)*/)){
                args = command.split(" ");
            }else{
                args.push('-e');
                args.push("'"+command.replace(/#.*\n/g,"").replace(/(\n)+/g,";").replace(/'/g,"\\'")+"'");
            }
            var exec = 'Rscript '+args.join(' ')+"\n";
            logic.webSocket.sendMessageToClient(clientId,{ Rcommand : exec });
            return new Promise(function(resolve,reject){
                var r = spawn('Rscript',args,{ cwd : executePath });
                var out;
                var err;
                r.stdout.on('data', (data) => {
                    data = data.toString();
                    out = (out ? out : '') + data;
                    logic.webSocket.sendMessageToClient(clientId,{ R: { stdout: data } });
                });
                r.stderr.on('data', (data) => {
                    data = data.toString();
                    err = (err ? err : '') + data;
                    logic.webSocket.sendMessageToClient(clientId,{ R: { stderr: data } });
                });
                r.on('close', (code) => {
                    switch(code){
                        case 0: return resolve({ stdout: out, stderr: err, executed: exec });
                        default: return reject({ stdout: out, stderr: err, code: code, executed: exec });
                    }
                });
            });
        },
        getExecutionPath : function(){
            return executePath;
        }
    }
};

/**
 devtools::install_github("hadley/svglite");library(svglite);x<-runif(1e3);y<-runif(1e3);tmp1<-\"/var/tmpfile\";system.time({;svglite(tmp1);plot(x,y);dev.off();});print(tmp1)
 */

/**
 devtools::install_github("hadley/svglite")
 library(svglite)
 x<-runif(1e3)
 y<-runif(1e3)
 tmp1<-"/var/tmpfile"
 system.time({
    svglite(tmp1)
    plot(x,y)
    dev.off()
 })
 print(tmp1)
 */