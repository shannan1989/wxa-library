import settings from '../settings.js';

exports.app_key = settings.ald.appKey;
exports.getLocation = settings.ald && settings.ald.getLocation;
exports.plugin = false;
