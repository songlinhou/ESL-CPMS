"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browserPlatform = {
    versions: function () {
        var u = navigator.userAgent, app = navigator.appVersion;
        return {
            trident: u.indexOf('Trident') > -1,
            presto: u.indexOf('Presto') > -1,
            webKit: u.indexOf('AppleWebKit') > -1,
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
            mobile: !!u.match(/AppleWebKit.*Mobile.*/),
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
            android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1,
            iPhone: u.indexOf('iPhone') > -1,
            iPad: u.indexOf('iPad') > -1,
            webApp: u.indexOf('Safari') == -1,
            weixin: u.indexOf('MicroMessenger') > -1,
        };
    }(),
    language: (navigator.browserLanguage || navigator.language).toLowerCase()
};
function getPlatform() {
    //判断是否IE内核
    if (exports.browserPlatform.versions.trident) {
        alert("is IE");
    }
    //判断是否webKit内核
    if (exports.browserPlatform.versions.webKit) {
        alert("is webKit");
    }
    //判断是否移动端
    if (exports.browserPlatform.versions.mobile) {
        alert("mobile");
    }
    if (exports.browserPlatform.versions.android) {
        alert("android");
    }
    if (exports.browserPlatform.versions.ios) {
        alert("IOS");
    }
}
exports.getPlatform = getPlatform;
//# sourceMappingURL=platform.js.map