import settings from '../settings.js';

if (settings.ald.enable) {
    let aldstat = require("../ald/ald-stat.js");
}

function prependFunction(options, name, func) {
    if (options[name]) {
        var s = options[name];
        options[name] = function (e) {
            func.call(this, e, name), s.call(this, e);
        };
    } else {
        options[name] = function (e) {
            func.call(this, e, name);
        };
    }
}

let WxApp = function (options) {
    prependFunction(options, 'onLaunch', function () { });
    prependFunction(options, 'onShow', function (options) {
        console.log(options);
    });
    prependFunction(options, 'onHide', function () { });
    prependFunction(options, 'onError', function (error) { });
    prependFunction(options, 'onPageNotFound', function (res) { });

    App(options);
};

export default WxApp;
