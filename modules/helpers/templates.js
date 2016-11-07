/**
 * Created by trzmiel007 on 04/09/16.
 */

var fs = require("fs");
var path = require("path");

module.exports = function(params, logger){
    var pathPrefix = path.join(__dirname,'..',params.temPath.join(path.sep));
    return {
        getTemplate : function(name,placeholders){
            var filename = name.match(/\.html$/) ? name : name + '.html';
            try {
                var content = fs.readFileSync(path.resolve(pathPrefix, filename), 'utf8');
                if(placeholders){
                    Object.keys(placeholders).forEach(function(place){
                        content = content.replace(params.tempPrefix + place.trim() + params.tempSufix, placeholders[place]);
                    });
                }
                return content;
            }catch(ex){
                logger.log('error','HTML template error ('+name+')',ex);
                return 'An error occurred while getting HTML content';
            }
        }
    };
};