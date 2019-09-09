declare var QrScanner: any;

export function setup_camera(){

    const video = document.getElementById('qr-video');

    // ####### Web Cam Scanning #######

    QrScanner.hasCamera().then((hasCamera:any) => {console.log("has camera?",hasCamera)});

    const scanner = new QrScanner((video:any, result:any) => {console.log("result=",result)});
    scanner.start();
}
