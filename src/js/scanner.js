"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setup_camera(onDecodedResultObtained) {
    //console.log("video=",video);
    // ####### Web Cam Scanning #######
    QrScanner.hasCamera().then(function (hasCamera) { console.log("has camera?", hasCamera); });
    window.scanner._onDecode = function (result) { onDecodedResultObtained(result); window.scanner.stop(); };
    window.scanner.start();
    $('#qr-video').css("object-fit", "fill");
    $('#qr-video').attr("height", "300");
}
exports.setup_camera = setup_camera;
//# sourceMappingURL=scanner.js.map