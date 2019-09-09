"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setup_camera() {
    var video = document.getElementById('qr-video');
    //console.log("video=",video);
    // ####### Web Cam Scanning #######
    QrScanner.hasCamera().then(function (hasCamera) { console.log("has camera?", hasCamera); });
    window.scanner.start();
}
exports.setup_camera = setup_camera;
//# sourceMappingURL=scanner.js.map