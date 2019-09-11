declare var QrScanner: any;
declare var jsQR: any;
let intervalHandler:any;

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

export function waitForScanned(onScanned:(scannedResult:any)=>void){
    // conversatonResultModal
    intervalHandler = setInterval(()=>{
        let qrResult = JSON.parse(localStorage.getItem("qr-result"));
        if(qrResult){
            clearInterval(intervalHandler);
            console.log("scanned detected");
            onScanned(qrResult);
        }
    },500)
}

export function cancelScannedWaiting(){
    // conversatonResultModal
    if(intervalHandler)
        clearInterval(intervalHandler);
}



