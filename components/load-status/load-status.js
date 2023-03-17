Component({
    properties: {
        status: {
            type: String,
            value: '',
            observer: function (newVal, oldVal) {
                if (newVal == oldVal) {
                    return;
                }

                if (newVal == 'loading') {
                    this.selectComponent("#loading").show();
                }
                else {
                    this.selectComponent("#loading").hide();
                }
            }
        }
    },
    data: {},
    methods: {
        onRefresh() {
            this.triggerEvent('Refresh', {}, {});
        }
    }
});
