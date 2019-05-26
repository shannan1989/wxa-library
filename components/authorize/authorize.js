import client from '../../client/client.js';

Component({
    properties: {},
    data: {
        hidden: false
    },
    methods: {
        onTouchMove() { },
        onTapButton() {
            this.setData({ hidden: true });
        },
        onGetUserInfo(e) {
            if (e.detail.userInfo) {
                this.triggerEvent('AuthOK', {}, {});
                client.fullAuth({}, e.detail);
            } else {
                this.setData({ hidden: false });
            }
        }
    }
});
