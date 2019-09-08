"use strict";
exports.__esModule = true;
function generateInvitingQRCodeURL(username, location, timestamp, size) {
    if (size === void 0) { size = "150x150"; }
    var dataJSON = {
        appname: "ESL-CPMS",
        username: username,
        location: location,
        timestamp: timestamp
    };
    return generateQRCodeAddr(JSON.stringify(dataJSON), size);
}
exports.generateInvitingQRCodeURL = generateInvitingQRCodeURL;
function generateQRCodeAddr(content, size) {
    if (size === void 0) { size = "150x150"; }
    //https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example
    return "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "&data=" + content;
}
exports.generateQRCodeAddr = generateQRCodeAddr;
function setupQRScanner(video_id) {
    var scanner = new Instascan.Scanner({ video: $("#" + video_id)[0] });
    scanner.addListener('scan', function (content) {
        console.log(content);
    });
    Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
            scanner.start(cameras[0]);
        }
        else {
            console.error('No cameras found.');
        }
    })["catch"](function (e) {
        console.error(e);
    });
}
exports.setupQRScanner = setupQRScanner;
