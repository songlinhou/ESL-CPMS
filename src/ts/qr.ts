declare var Instascan:any;



export function generateInvitingQRCodeURL(username:string,location:string,timestamp:string,size:string="150x150"):string{
    let dataJSON = {
        appname:"ESL-CPMS",
        username:username,
        location:location,
        timestamp:timestamp
    };
    return generateQRCodeAddr(JSON.stringify(dataJSON),size);
}


export function generateQRCodeAddr(content:string,size:string="150x150"):string{
    //https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${content}`;
}

export function setupQRScanner(video_id:string){
    let scanner = new Instascan.Scanner({ video: $( `#${video_id}` )[0] });
    scanner.addListener('scan', function (content:string) {
    console.log(content);
    });
    Instascan.Camera.getCameras().then(function (cameras:any) {
    if (cameras.length > 0) {
        scanner.start(cameras[0]);
    } else {
        console.error('No cameras found.');
    }
    }).catch(function (e:any) {
    console.error(e);
    });
}