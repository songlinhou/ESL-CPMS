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
function pause_scanner() {
    var iframe = $('#scannerIframe'); // or some other selector to get the iframe
    $('#video', iframe.contents())[0].pause();
}
exports.pause_scanner = pause_scanner;
function start_scanner() {
    var iframe = $('#scannerIframe'); // or some other selector to get the iframe
    $('#video', iframe.contents())[0].play();
}
exports.start_scanner = start_scanner;
function setupScannerHandler() {
    window.onQRCodeScanned = function (information) {
        console.log("info get", information);
    };
}
exports.setupScannerHandler = setupScannerHandler;
//# sourceMappingURL=scanner.js.map