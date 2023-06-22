import client from 'client.js';

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

let WxPage = function (options) {
    let wxPage = options.wxPage || {};

    if (wxPage.enablePageRequest) {
        options.pageRequest = function (opts) {
            if (this.data.status == 'loading' || this.data.status == 'auth') {
                return;
            }

            let isUpdate = opts.isUpdate;
            if (isUpdate === null) {
                if (this.data.loadStatus == 'success') {
                    isUpdate = true;
                }
                else {
                    isUpdate = false;
                }
            }
            if (!isUpdate && this.data.loadStatus != 'loading') {
                this.setData({ loadStatus: 'loading' });
            }

            let successCallback = () => {
                opts.request && client.request({
                    type: opts.request.type,
                    data: opts.request.data,
                    success: (res) => {
                        if (!isUpdate) {
                            this.setData({ loadStatus: 'success' });
                        }
                        opts.request.success && opts.request.success(res);
                    },
                    fail: (res) => {
                        if (!isUpdate) {
                            this.setData({ loadStatus: 'fail' });
                        }
                        opts.request.fail && opts.request.fail(res);
                    },
                    complete: (res) => {
                        wx.stopPullDownRefresh();
                        opts.request.complete && opts.request.complete(res);
                    }
                });

                opts.request || this.setData({ loadStatus: 'success' });
            };

            let options = wx.getLaunchOptionsSync();
            if (options.scene == 1154) {
                opts.auth = null;
            }

            if (!opts.auth) {// 无需登录
                successCallback();
            } else {
                client.auth({
                    success: (res) => {
                        opts.auth.success && opts.auth.success();
                        successCallback();
                    },
                    fail: (res) => {
                        if (!isUpdate) {
                            if (this.data.loadStatus != 'success') {
                                this.setData({ loadStatus: 'fail' });
                            }
                        }
                        opts.auth.fail && opts.auth.fail();
                        wx.stopPullDownRefresh();
                    }
                });
            }
        };
    }

    if (wxPage.enableNextPage) {
        options.__onLoad = options.onLoad;
        options.onLoad = function (opts) {
            if (opts.nextPage) {
                this.__opts = opts;
                this.__navigating = true;
                wx.navigateTo({
                    url: decodeURIComponent(opts.nextPage),
                    success: () => {
                        this.__navigating = false;
                    },
                    fail: () => {
                        this.__navigating = false;
                        this.__onLoad(this.__opts);
                        this.__opts = null;
                    }
                })
            } else {
                this.__onLoad(opts);
            }
        };
        prependFunction(options, 'onShow', function () {
            if (this.__navigating == true || !this.__opts) {
                return;
            }
            this.__navigating = false;
            this.__onLoad(this.__opts);
            this.__opts = null;
        });
    }

    Page(options);
};

export default WxPage;
