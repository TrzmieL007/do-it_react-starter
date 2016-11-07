/**
 * Created by trzmiel007 on 25/08/16.
 */

var fs = require("fs");
var path = require("path");

module.exports = function(config, logger, staticParams){
    var pool = {};
    var dbPath;
    if(config.relativePath){
        dbPath = path.resolve(__dirname, '..','..', config.relativePath.join(path.sep));
    }else if(config.absolutePath){
        dbPath = path.resolve(config.absolutePath.join(path.sep));
    }

    /**
     * Error codes:
     * 0 - success,
     * 1 - Unknown error,
     * 2 - I/O error (writing or reading file error),
     * 3 - wrong path (not a file nor directory),
     * 4 - no file name for creating in a directory,
     * 5 - file already exists, trying to overwrite it
     */
    return {
        getConnectionPool : function(){ return pool; },
        getConnection : function(){
            return pool.getConnection();
        },
        insert : function(params){
            return new Promise(function(resolve,reject){
                var filePath = path.join(dbPath,params.path);
                var json = typeof params.json == 'undefined' ? true : params.json;
                fs.stat(filePath,function(err,stat){
                    if(err){
                        fs.writeFile(filePath,
                            (json ? JSON.stringify(params.content) : params.content),
                            'utf8',
                            function(error2) {
                                if(error2) return reject({
                                    code: 2,
                                    message: 'Error writing to new file',
                                    error: error2
                                });
                                console.log('file has ben created :)');
                                return resolve("created file " + filePath);
                            });
                    }else if(stat.isFile()){
                        return reject({code: 5, message: "File already exists, if you want to modity it, use update."});
                    }else if(stat.isDirectory()){
                        if(params.fileName){
                            fs.writeFile(
                                path.join(filePath,params.fileName),
                                (json ? JSON.stringify(params.content) : params.content),
                                'utf8',
                                function(error3){
                                    if(error3) return reject({code: 2, message: 'Error writing to new file', error: error3});
                                    return resolve("created file "+params.fileName+" in directory "+filePath);
                                });
                        }else{
                            return reject({code: 4, message: "Path is for directory, but no filename supplied"});
                        }
                    }else
                        return reject({code: 3, message: "Supplied path is not a file nor a directory"});
                });
            });
        },
        get : function(params){
            return new Promise(function(resolve,reject){
                var filePath = path.resolve(dbPath,params.path);
                var json = typeof params.json == 'undefined' ? true : params.json;
                fs.stat(filePath,function(err,stat){
                    if(err) return reject({code: 3, message: "File not found", error: err});
                    if(stat.isDirectory()){
                        fs.readdir(filePath,function(e,files){
                            if(e) return reject({code: 2, message: 'Error while listing files from '+filePath, error: e});
                            return resolve(files);
                        });
                    }else if(stat.isFile()){
                        fs.readFile(filePath,'utf8',function(e,content){
                            if(e) return reject({code: 2, message: 'Error reading file '+filePath, error: e});
                            return resolve(json ? JSON.parse(content) : content);
                        });
                    }else
                        return reject({code: 3, message: "Supplied path is not a file nor a directory"});
                });
            });
        },
        update : function(params){
            return new Promise(function(resolve,reject){
                var filePath = path.join(dbPath,params.path);
                var json = typeof params.json == 'undefined' ? true : params.json;
                fs.stat(filePath,function(err,stat){
                    if(err)return reject({code: 3, message: "File not found", error: err});
                    if(stat.isFile()){
                        fs.readFile(filePath,'utf8',function(e,content){
                            if(e) return reject({code: 2, message: 'Error reading file '+filePath, error: e});
                            fs.writeFile(
                                filePath,
                                (json ? JSON.stringify(params.content) : params.content),
                                'utf8',
                                function(e2){
                                    if(e2){
                                        return reject({code: 2, message: 'Error writing to file '+filePath, error: e2});
                                    }
                                    return resolve("updated file "+filePath);
                                }
                            );
                        });
                    }else if(stat.isDirectory()){
                        return reject({code: 3, message: "Update can be executed only on files"});
                    }else
                        return reject({code: 3, message: "Supplied path is not a file nor a directory"});
                });
            });
        },
        delete : function(params){
            return new Promise(function(resolve,reject){
                var filePath = path.join(dbPath,params.path);
                fs.stat(filePath,function(err,stat){
                    if(err) return reject({code: 3, message: "File not found", error: err});
                    if(stat.isFile()){
                        fs.unlink(filePath,function(e){
                            if(e) return reject({code: 2, message: 'Cant remove file '+filePath, error: e});
                            return resolve("removed file "+filePath);
                        });
                    }else if(stat.isDirectory()){
                        fs.readdir(filePath,'utf8',function(e,files){
                            if(e) return reject({code: 2, message: 'Error while getting files from '+filePath, error: e});
                            var error;
                            files.every(function(file){
                                try {
                                    fs.unlinkSync(path.resolve(filePath,file));
                                    return true;
                                }catch(ex){
                                    error = ex;
                                    return false;
                                }
                            });
                            if(error){
                               return reject({code: 2, message: "Filed while removing files from directry "+filePath, error: error});
                            }
                            fs.rmdir(filePath,function(error2) {
                                if(error2) return reject({code: 3, message: "Can not remove dir "+filePath, error: error2});
                                return resolve("deleted folder "+filePath+"\n"+files.join(", "));
                            });
                        });
                    }else
                        return reject({code: 3, message: "Supplied path is not a file nor a directory"});
                });
            });
        },
        exists : function(params){
            var filePath = path.join(dbPath,params.path);
            if(params.sync){
                try{
                    fs.statSync(filePath);
                    return filePath;
                }catch(e){
                    return false;
                }
            }else{
                return new Promise(function(resolve,reject){
                    fs.stat(filePath,function(err){
                        if(err) return reject();
                        return resolve(filePath);
                    });
                });
            }
        },
        getDbPath : function(){
            return dbPath;
        }
    };
};