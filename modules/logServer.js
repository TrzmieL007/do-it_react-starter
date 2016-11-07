/**
 * Created by trzmiel007 on 22/08/16.
 */

var fs = require('fs');
var path = require('path');

function get(req,res){
    if(req.url.match(/.*\/js\/jquery-([0-9]+\.)+(min)?\.js$/)){
        var filename = req.url.replace(/.*\/js\/(jquery-([0-9]+\.)+(min)?\.js$)/,"$1");
        var jsPath = path.resolve(__dirname,'..','statics','js',filename);
        fs.stat(jsPath, function (err) {
            if(err){
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('404 Not Found\n');
                return res.end();
            }
            fs.readFile(jsPath,'utf8',function(error,content){
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(content);
            });
        });
        return;
    }
    res.writeHead(200, {'Content-Type': 'text/html'});

    var content = fs.readFileSync(path.resolve(__dirname,'..','templates','logSrv.html'),'utf8');
    var fileList = '';
    var logFiles = fs.readdirSync(path.join(__dirname, '..', 'logs'));

    logFiles.forEach(function(file){
        if(file.match(/.\.log$/)){
            fileList += "\t\t\t<li><a href='/?file=" + file + "'>" + file + "</a></li>\n";
        }
    });
    content = content.replace('<!--// FileList //-->',fileList);
    var file = req.url.match(/.+\?.*file=.+$/) ? req.url.replace(/([^?]+)(\?.*)(file=)([^&]+)(.*$)/,"$4") : null;

    if(file){
        var result = "\t\t\t<span class='cmd'>";
        var filePath = path.resolve(__dirname,'..','logs',file);
        fs.stat(filePath,function(error,stat){
            if(error){
                result += file + ": No such file or directory</span>";
                return res.end(content.replace('<!--// Result //-->',result));
            }
            result += "# less " + file;
            fs.readFile(filePath,'utf8',function(err,fileContent){
                if(err){
                    result += "Fatal ERROR! Can not read file";
                    return res.end(content.replace('<!--// Result //-->',result));
                }
                result += "</span>\n\t\t\t<pre>\n"+fileContent.replace(/(.*?)(\[[0-9]{2}m)(.+?)(\[39m)(.*?)/g,function(x,a,b,c){
                        return a+"<span class=\""+b.replace("[","c")+"\">"+c+"</span>";
                    }).replace(/\\n/g,"\n").replace(/\\u001b/g,"")+"\n\t\t\t</pre>\n\t\t\tEnd\n\t\t\t";
                result += '<div class="fName"><span id="commandSpan">'+file+'</span><span class="placeholder"></span>'
                    + '<div class="scrollToEnd" onClick="$(\'html, body\').animate({scrollTop:document.body.offsetHeight},512);"></div>'
                    + '<div class="scrollToTop" onClick="$(\'html, body\').animate({scrollTop:0},512);"></div></div>';
                return res.end(content.replace('<!--// Result //-->',result));
            });
        });
    }else{
        return res.end(content);
    }
}
var commands = {
    rm : function(args){
        return args.reduce(function(p,arg){
            if(arg.startsWith('-')){

            }else{
                var file = path.resolve(__dirname,'..','logs',arg);
                try{
                    fs.unlinkSync(file);
                }catch(ex){
                    p.push("rm: "+file+": No such file or directory");
                }
            }
            return p;
        },[]).join("\n");
    },
    less : function(args){
        return { redirect: '?file='+args[0] };
    },
    ls : function(args){
        var listInArray = false;
        args.forEach(function(arg){ if(arg == '-L') listInArray = true; });
        return fs.readdirSync(path.join(__dirname, '..', 'logs')).reduce(function(p,file){
            if(file.match(/.\.log$/)){
                if(listInArray){
                    p.fileList.push(file);
                }else {
                    p += "\t\t\t<a href='/?file=" + file + "'>" + file + "</a><br/>\n";
                }
            }
            return p;
        },listInArray?{fileList:[]}:"");
    }
};
function post(req,res){
    var command = decodeURIComponent(req.url.substr(1));
    var arguments = command.split(' ');
    var prog = arguments.shift();
    res.writeHead(200,{'Access-Control-Allow-Origin':'*','Content-Type':'application/json; charset=utf-8'});
    return res.end(JSON.stringify({
        program: prog,
        arguments: arguments,
        result: commands.hasOwnProperty(prog) ? commands[prog](arguments) : '-sh: '+prog+': command not found'
    }));
}
module.exports = function(req, res){
    if(req.method.toLowerCase() == 'post') return post(req, res);
    return get(req, res);
};