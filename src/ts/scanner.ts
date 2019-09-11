declare var QrScanner: any;
declare var jsQR: any;


export function setup_camera(onDecodedResultObtained:(result:string) => void){

    //console.log("video=",video);
    // ####### Web Cam Scanning #######

    QrScanner.hasCamera().then((hasCamera:any) => {console.log("has camera?",hasCamera)});

    (<any>window).scanner._onDecode =  (result:string) => {onDecodedResultObtained(result);(<any>window).scanner.stop()};   
    (<any>window).scanner.start();
    $('#qr-video').css("object-fit","fill");
    $('#qr-video').attr("height","300");
}

export function pause_scanner(){
    let iframe = $('#scannerIframe'); // or some other selector to get the iframe
    (<any>$('#video', iframe.contents())[0]).pause();
}

export function start_scanner(){
    let iframe = $('#scannerIframe'); // or some other selector to get the iframe
    (<any>$('#video', iframe.contents())[0]).play();
}


function drawLine(canvas:any,begin:any, end:any, color:any) {
    canvas.beginPath();
    canvas.moveTo(begin.x, begin.y);
    canvas.lineTo(end.x, end.y);
    canvas.lineWidth = 4;
    canvas.strokeStyle = color;
    canvas.stroke();
}

export function setupScannerCamera(){
    let iframe = $('#scannerIframe'); // or some other selector to get the iframe

    let video:any = <any>$('#video', iframe.contents())[0];
    let canvasElement:any = <any>$('#canvas', iframe.contents())[0];
    let canvas = canvasElement.getContext("2d");
    let loadingMessage = <any>$('#loadingMessage', iframe.contents())[0];
    let finished = false;
        // var outputContainer = document.getElementById("output");
        // var outputMessage = document.getElementById("outputMessage");
        // var outputData = document.getElementById("outputData");
    
    
    
    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.play();
        requestAnimationFrame(tick);
    });

    let tickID;
    
    function tick() {
        loadingMessage.innerText = "⌛ Loading video..."
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
        loadingMessage.hidden = true;
        canvasElement.hidden = false;
        // outputContainer.hidden = false;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        let imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        if(!finished){
            let code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });
            if (code) {
                drawLine(canvas,code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
                drawLine(canvas,code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
                drawLine(canvas,code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
                drawLine(canvas,code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
            //   outputMessage.hidden = true;
            //   outputData.parentElement.hidden = false;
            //   outputData.innerText = code.data;
                console.log("data=",code.data);
                finished = true;
            } else {
            //   outputMessage.hidden = false;
            //   outputData.parentElement.hidden = true;
                tickID = requestAnimationFrame(tick);
            }
            }
        }
        
        
    }
}

