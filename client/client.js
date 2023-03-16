import settings from '../settings.js';
import cookie from 'cookie.js';
import cache from 'cache.js';

let client = {
    request(params) {
        let url = '', data = {}, header = {};

        if (params.url) {
            url = params.url;
        } else {
            url = (settings.debug && settings.debugRequestUrl) ? settings.debugRequestUrl : settings.requestUrl;
            url = url + '?' + params.type + '&app=' + settings.app + '&appVersion=' + settings.appVersion;
        }

        data._cookies = cookie.getAll();
        data._agent = {
            app: settings.app,
            appVersion: settings.appVersion
        };

        if (params.type) {
            data.type = params.type;
        }

        if (params.data) {
            for (let i in params.data) {
                data[i] = params.data[i];
            }
        }

        settings.debug && console.log(url + '&data=' + encodeURIComponent(JSON.stringify(data)));
        settings.debug && console.log('action', params.type, params.data);

        wx.request({
            url: url,
            data: data,
            header: header,
            method: params.method ? params.method : 'POST',
            dataType: 'json',
            responseType: 'text',
            success: function (res) {
                if (res.statusCode == 200) {
                    for (let key in res.data.caches) {
                        cache.add(key, res.data.caches[key]);
                    }
                    for (let key in res.data.cookies) {
                        cookie.add(key, res.data.cookies[key]);
                    }
                    params.success && params.success(res.data);
                } else {
                    params.fail && params.fail(res);
                }
            },
            fail: function (res) {
                params.fail && params.fail(res);
            },
            complete: function (res) {
                params.complete && params.complete(res);
            }
        });
    },
    _doAuthing: 0,
    auth(options) {
        if (options.success || options.fail) {
            this._addCallback('Auth', options);
        }

        if (this.baseAuthed()) {
            this._triggerCallbacks('Auth', 'success', this.getUser());
            return;
        }

        if (this._doAuthing >= 1) {
            return;
        }
        this._doAuthing = 1;

        wx.login({
            success: (res) => {
                client.request({
                    type: 'Auth',
                    data: { code: res.code },
                    success: (res) => {
                        this._doAuthing = 0;
                        if (res.errcode == 0) {
                            this._triggerCallbacks('Auth', 'success', this.getUser());
                        } else {
                            this._triggerCallbacks('Auth', 'fail', res);
                        }
                    },
                    fail: (res) => {
                        this._doAuthing = 0;
                        this._triggerCallbacks('Auth', 'fail', res);
                    }
                });
            }
        });
    },
    getUser() {
        return cache.get('user');
    },
    baseAuthed() {
        let user = this.getUser();
        return user != null;
    },

    _callbacks: {},
    _addCallback(key, obj) {
        if (!this._callbacks[key]) {
            this._callbacks[key] = [];
        }
        this._callbacks[key].push(obj);
    },
    _hasCallback(key) {
        return !!(this._callbacks[key]) && this._callbacks[key].length > 0;
    },
    _triggerCallbacks(key, callbackType, data, clear = true) {
        if (!this._callbacks[key]) {
            return;
        }

        if (callbackType) {
            for (let obj of this._callbacks[key]) {
                if (obj[callbackType]) {
                    obj[callbackType](data);
                }
            }
        }

        if (clear) {
            this._callbacks[key] = [];
        }
    }

};

export default client;
