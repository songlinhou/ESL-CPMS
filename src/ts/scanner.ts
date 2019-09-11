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

export function setupScannerHandler(){
    (<any>window).onQRCodeScanned = (information:string) => {
        console.log("info get",information);
    }
}



