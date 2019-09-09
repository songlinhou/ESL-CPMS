"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setup_camera() {
    var video = document.getElementById('qr-video');
    // ####### Web Cam Scanning #######
    QrScanner.hasCamera().then(function (hasCamera) { console.log("has camera?", hasCamera); });
    var scanner = new QrScanner(function (video, result) { console.log("result=", result); });
    scanner.start();
}
exports.setup_camera = setup_camera;
//# sourceMappingURL=scanner.js.map