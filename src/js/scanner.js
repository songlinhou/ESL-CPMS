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
function drawLine(canvas, begin, end, color) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
}
function setupScannerCamera() {
    var iframe = $('#scannerIframe'); // or some other selector to get the iframe
    var video = $('#video', iframe.contents())[0];
    var canvasElement = $('#canvas', iframe.contents())[0];
    var canvas = canvasElement.getContext("2d");
    var loadingMessage = $('#loadingMessage', iframe.contents())[0];
    var finished = false;
    // var outputContainer = document.getElementById("output");
    // var outputMessage = document.getElementById("outputMessage");
    // var outputData = document.getElementById("outputData");
    // Use facingMode: environment to attemt to get the front camera on phones, user
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then(function (stream) {
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.play();
        requestAnimationFrame(tick);
    });
    var tickID;
    function tick() {
        loadingMessage.innerText = "⌛ Loading video...";
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            loadingMessage.hidden = true;
            canvasElement.hidden = false;
            // outputContainer.hidden = false;
            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            if (!finished) {
                var code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });
                if (code) {
                    drawLine(canvas, code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
                    drawLine(canvas, code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
                    drawLine(canvas, code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
                    drawLine(canvas, code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
                    //   outputMessage.hidden = true;
                    //   outputData.parentElement.hidden = false;
                    //   outputData.innerText = code.data;
                    console.log("data=", code.data);
                    //finished = true;
                }
                else {
                    //   outputMessage.hidden = false;
                    //   outputData.parentElement.hidden = true;
                    // finished = false;
                }
            }
            else {
                //finished
            }
            tickID = requestAnimationFrame(tick);
        }
    }
}
exports.setupScannerCamera = setupScannerCamera;
//# sourceMappingURL=scanner.js.map