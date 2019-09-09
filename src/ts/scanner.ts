declare var QrScanner: any;

export function setup_camera(){
    const video = document.getElementById('scanner');

    function setResult(result:any) {
        console.log("result=",result);
    }

    // ####### Web Cam Scanning #######

    QrScanner.hasCamera().then((hasCamera:any) => {console.log("has camera?",hasCamera)});

    const scanner = new QrScanner((video:any, result:any) => {setResult(result)});
    scanner.start();

    document.getElementById('inversion-mode-select').addEventListener('change', event => {
    scanner.setInversionMode((<any>(event.target)).value);
    });
}