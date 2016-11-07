/**
 * Created by trzmiel007 on 22/08/16.
 */
var fs = require('fs');
var path = require('path');

module.exports = function(){
    this.World = require('../support/world.js').World;
    this.path = '';
    this.content = '';
    this.parameters = [];
    this.method = '';
    this.result = null;

    this.Given(/^filePath (.+)$/,function(path,next){
        this.path = path;
        next();
    });

    this.Given(/^content ([^\s]+) (.+)$/,function(content,part,next){
        this.content = path.resolve(content,part);
        next();
    });

    this.Given(/^parameter (.+)$/, function(param,next){
        if(!this.parameters) this.parameters = [];
        this.parameters.push(param);
        next();
    });

    this.Given(/^parameters (([^,\s]+)\,\s)*$/, function(params,next){
        console.log(params);
        next();
    });

    this.When(/^I write it to file$/,function(next){
        fs.writeFile(this.path,this.content,'utf8',function(err){
            if(err) throw(new Error(err));
            next();
        });
    });

    this.When(/^I read it$/,function(next){
        fs.readFile(this.path,'utf8','r',(error,source)=>{
            if(error) throw(new Error(error));
            this.content = source;
            next();
        });
    });

    this.When(/^I execute ([a-zA-Z\s]+)$/,function(method,next){
        if(method.match(/Sync$/)){
            try {
                this.result = fs[method].apply(this, this.parameters);
            }catch(e){
                throw(new Error("My Error:\n"+JSON.stringify(e,null,4)));
            }
            next();
        }else{
            var result = this.result;
            fs[method].apply(this,this.parameters,function(){
                result = arguments;
                next();
            });
        }
    });

    this.Then(/^I go to next scenario$/,function(next){
        next();
    });

    this.Then(/^I get (.+)$/,function(result,next){
        if(result != this.content) throw(new Error(this.content+" != "+result));
        console.log(this.content);
        next();
    });

    this.Then(/^I shoud get (.+)$/, function(res,next){
        try{
            res = JSON.parse(res);
            if(typeof res !== typeof this.result)
                throw(
                    new Error(
                        "Result is of wrong type\n"
                        + "The results differ\nResult expected:\n"
                        + JSON.stringify(res,null,4)
                        + "\nbut got result:\n"
                        + JSON.stringify(this.result,null,4)
                    )
                );
            if(typeof res == "object"){
                var test = (o1,o2) => Object.keys(o1).forEach(key => {
                    if(typeof o1[key] !== typeof o2[key])
                        throw(
                            new Error(
                                + "The results differ\nResult expected:\n"
                                + JSON.stringify(res,null,4)
                                + "\nbut got result:\n"
                                + JSON.stringify(this.result,null,4)
                            )
                        );
                    if(typeof o1[key] == "object") test(o1[key],o2[key]);
                    if(o1[key] !== o2[key])
                        throw(
                            new Error(
                                + "The results differ\nResult expected:\n"
                                + JSON.stringify(res,null,4)
                                + "\nbut got result:\n"
                                + JSON.stringify(this.result,null,4)
                            )
                        );
                },this);
                test(this.result,res);
            }else if(res !== this.result)
                throw(
                    new Error(
                        + "The results differ\nResult expected:\n"
                        + JSON.stringify(res,null,4)
                        + "\nbut got result:\n"
                        + JSON.stringify(this.result,null,4)
                    )
                );
        }catch(e){
            if(res !== this.result)
                throw(
                    new Error(
                        + "The results differ\nResult expected:\n"
                        + JSON.stringify(res,null,4)
                        + "\nbut got result:\n"
                        + JSON.stringify(this.result,null,4)
                    )
                );
        }
        next();
    });
};