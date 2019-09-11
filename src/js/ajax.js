"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var global_base_url = 'https://34.66.91.169:8888';
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
// export function sendHTTPRequest(full_url:string,data:any,method:string){
//     return $.ajax({
//         url: full_url,
//         method: method,
//     });
// }
//# sourceMappingURL=ajax.js.map