"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setup_camera() {
    var video = document.getElementById('scanner');
    function setResult(result) {
        console.log("result=", result);
    }
    // ####### Web Cam Scanning #######
    QrScanner.hasCamera().then(function (hasCamera) { console.log("has camera?", hasCamera); });
    var scanner = new QrScanner(function (video, result) { setResult(result); });
    scanner.start();
    document.getElementById('inversion-mode-select').addEventListener('change', function (event) {
        scanner.setInversionMode((event.target).value);
    });
}
exports.setup_camera = setup_camera;
//# sourceMappingURL=scanner.js.map