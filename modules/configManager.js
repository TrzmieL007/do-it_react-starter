/**
 * Created by trzmiel007 on 22/08/16.
 */

var path = require("path");
var fs = require("fs");

module.exports = function(configFileName, configDirectoryPath){
    var conf = {
        configPath: configDirectoryPath || "settings",
        mainConfigFile: configFileName || "config.json",
        configs: null,
        globals: null,
        merge: function(confObj){
            Object.keys(confObj.files).forEach(function(file){
                var fileDescr = confObj.files[file];
                if(fileDescr.fileName){
                    var filePath = path.resolve(__dirname,this.configPath,fileDescr.fileName);
                    try{
                        fs.statSync(filePath);
                        try{
                            confObj.files[file].content = JSON.parse(fs.readFileSync(filePath,'utf8'));
                        }catch(err){
                            console.log(
                                "Error in config file "
                                +fileDescr.fileName+"\n"
                                +JSON.stringify(err,null,4)
                            );
                        }
                    }catch(e){
                        console.log("Missing config file: "+filePath+"\n"+JSON.stringify(e,null,4));
                    }
                }
            },this);
            this.configs = confObj.files;
            this.globals = confObj.globals;
        }
    };

    var filePath = path.resolve(__dirname,conf.configPath,conf.mainConfigFile);
    try{
        fs.statSync(filePath);
        try {
            conf.merge(JSON.parse(fs.readFileSync(filePath, 'utf8')));
        }catch(e){
            throw(new Error("File error\n"+JSON.stringify(e,null,4)));
        }
    }catch(error){
        throw(new Error("Can't find the config file\n"+JSON.stringify(error,null,4)));
    }

    return {
        get: function(name){
            return conf.configs[name] ? conf.configs[name].content : null;
        },
        getGlobal: function(name){
            return conf.globals[name];
        }
    }
};