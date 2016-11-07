/**
 * Created by trzmiel007 on 22/08/16.
 */

var zombie = require('zombie');
function World() {
    this.browser = new zombie();

    this.visit = function (url, callback) {
        this.browser.visit(url, callback);
    };
}

exports.World = function() {
    this.World = World;
};