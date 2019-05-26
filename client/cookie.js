let cookie = {
    _cookies: {},
    add(key, value) {
        this._cookies[key] = value;
    },
    getAll() {
        return this._cookies;
    }
};

export default cookie;
