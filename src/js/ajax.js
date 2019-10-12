"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// let global_base_url = 'https://34.66.91.169:8888';
var global_base_url = 'https://www.esl.today'; // for production
// let global_base_url = 'http://157.245.82.60:8888'; //for development
function sendJsonp(url, data, method, callback) {
    return $.ajax({
        url: global_base_url + url,
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
    if (global_base_url == 'https://www.esl.today') {
        console.log("On Product Server");
        return;
    }
    else if (global_base_url == 'http://157.245.82.60:8888') {
        console.log("On Test Server");
        return;
    }
    console.log("On Server " + global_base_url);
}
exports.displayServerAddr = displayServerAddr;
// export function sendHTTPRequest(full_url:string,data:any,method:string){
//     return $.ajax({
//         url: full_url,
//         method: method,
//     });
// }
//# sourceMappingURL=ajax.js.map