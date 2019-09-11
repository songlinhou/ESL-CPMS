declare var QrScanner: any;
declare var jsQR: any;
let intervalHandler:any;

export function setupIOSCamera(onDecodedResultObtained:(result:string) => void){

    //console.log("video=",video);
    // ####### Web Cam Scanning #######

    QrScanner.hasCamera().then((hasCamera:any) => {console.log("has camera?",hasCamera)});

    (<any>window).scanner._onDecode =  (result:string) => {onDecodedResultObtained(result);(<any>window).scanner.stop()};   
    (<any>window).scanner.start();
    $('#qr-video').css("object-fit","fill");
    $('#qr-video').attr("height","300");
}

export function waitForScanned(onScanned:(scannedResult:any)=>void){
    // conversatonResultModal
    intervalHandler = setInterval(()=>{
        let qrResult = localStorage.getItem("qr-result");
        if(qrResult){
            try{
                JSON.parse(qrResult)
            }
            catch(e){
                console.log("bad format for qr-result. Incorrect QR code.");
                localStorage.setItem("qr-result","");
                return;
            }
            clearInterval(intervalHandler);
            console.log("scanned detected");
            onScanned(qrResult);
            localStorage.setItem("scanning", "n");
            localStorage.setItem("qr-result","");
        }
    },500)
}

export function cancelScannedWaiting(){
    // conversatonResultModal
    if(intervalHandler)
        clearInterval(intervalHandler);
    localStorage.setItem("qr-result","");
    localStorage.setItem("scanning", "n");
}



