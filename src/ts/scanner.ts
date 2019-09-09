declare var QrScanner: any;



export function setup_camera(){

    //console.log("video=",video);
    // ####### Web Cam Scanning #######

    QrScanner.hasCamera().then((hasCamera:any) => {console.log("has camera?",hasCamera)});

    
    (<any>window).scanner.start();
    
}
