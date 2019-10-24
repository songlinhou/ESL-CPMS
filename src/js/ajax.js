"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dev_1 = require("./dev");
// let global_base_url = 'https://34.66.91.169:8888';
// let global_base_url = 'https://www.esl.today'; // for production
// let global_base_url = 'http://157.245.82.60:8888'; //for development
exports.global_base_url = "";
exports.serverOnline = false;
if (dev_1.isDev()) {
    exports.global_base_url = 'http://127.0.0.1:8888';
}
else {
    exports.global_base_url = 'https://esl-server.herokuapp.com';
}
function setServerOnline() {
    exports.serverOnline = true;
}
exports.setServerOnline = setServerOnline;
function setServerOffline() {
    exports.serverOnline = false;
}
exports.setServerOffline = setServerOffline;
function isServerOnline() {
    return exports.serverOnline;
}
exports.isServerOnline = isServerOnline;
function sendJsonp(url, data, method, callback) {
    return $.ajax({
        url: exports.global_base_url + url,
        method: method,
        // The name of the callback parameter, as specified by the YQL service
        jsonp: 'callback',
        // Tell jQuery we're expecting JSONP
        dataType: "jsonp",
        // Tell YQL what we want and that we want JSON
        data: data,
        jsonpCallback: callback
    });
}
exports.sendJsonp = sendJsonp;
function displayServerAddr() {
    if (exports.global_base_url == 'https://www.esl.today') {
        console.log("On Product Server");
        return;
    }
    else if (exports.global_base_url == 'http://157.245.82.60:8888') {
        console.log("On Test Server");
        return;
    }
    console.log("On Server " + exports.global_base_url);
}
exports.displayServerAddr = displayServerAddr;
// export function sendHTTPRequest(full_url:string,data:any,method:string){
//     return $.ajax({
//         url: full_url,
//         method: method,
//     });
// }
//# sourceMappingURL=ajax.js.map