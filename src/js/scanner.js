"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var intervalHandler;
function setupIOSCamera(onDecodedResultObtained) {
    //console.log("video=",video);
    // ####### Web Cam Scanning #######
    QrScanner.hasCamera().then(function (hasCamera) { console.log("has camera?", hasCamera); });
    window.scanner._onDecode = function (result) { onDecodedResultObtained(result); window.scanner.stop(); };
    window.scanner.start();
    $('#qr-video').css("object-fit", "fill");
    $('#qr-video').attr("height", "280");
}
exports.setupIOSCamera = setupIOSCamera;
function waitForScanned(onScanned) {
    // conversatonResultModal
    intervalHandler = setInterval(function () {
        var qrResult = localStorage.getItem("qr-result");
        if (qrResult) {
            try {
                JSON.parse(qrResult);
            }
            catch (e) {
                console.log("bad format for qr-result. Incorrect QR code.");
                localStorage.setItem("qr-result", "");
                return;
            }
            clearInterval(intervalHandler);
            console.log("scanned detected");
            onScanned(qrResult);
            localStorage.setItem("scanning", "n");
            localStorage.setItem("qr-result", "");
        }
    }, 500);
}
exports.waitForScanned = waitForScanned;
function cancelScannedWaiting() {
    // conversatonResultModal
    if (intervalHandler)
        clearInterval(intervalHandler);
    localStorage.setItem("qr-result", "");
    localStorage.setItem("scanning", "n");
}
exports.cancelScannedWaiting = cancelScannedWaiting;
//# sourceMappingURL=scanner.js.map