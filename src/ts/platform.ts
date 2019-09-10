export let browserPlatform={
    versions:function(){
        var u = navigator.userAgent, app = navigator.appVersion;
        return {
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,//火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Adr') > -1, //android终端
            iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
            weixin: u.indexOf('MicroMessenger') > -1, //是否微信 （2015-01-22新增）
        };
    }(),
    language:((<any>navigator).browserLanguage || navigator.language).toLowerCase()
}

export function getPlatform(){
    //判断是否IE内核
    if(browserPlatform.versions.trident)
    { alert("is IE"); }
    //判断是否webKit内核
    if(browserPlatform.versions.webKit)
    { alert("is webKit"); }
    //判断是否移动端
    if(browserPlatform.versions.mobile){
        alert("mobile");
    }
    if(browserPlatform.versions.android){
        alert("android");
    }
    if(browserPlatform.versions.ios){
        alert("IOS");
    }
}

