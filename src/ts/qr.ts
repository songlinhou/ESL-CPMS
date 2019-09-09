import { ICoordinate, processCoordinates, getDistanceBetween } from "./location";

declare var Instascan:any;


interface IQRJSON {
    appname:string,
    username:string,
    latitude:number,
    longitude:number,
    timestamp:string
};


export function generateInvitingQRCodeURL(username:string,location:ICoordinate,timestamp:string,size:string="150x150"):string{
    let dataJSON:IQRJSON = {
        appname:"ESL-CPMS",
        username:username,
        latitude:location.latitude,
        longitude:location.longitude,
        timestamp:timestamp
    };
    return generateQRCodeAddr(JSON.stringify(dataJSON),size);
}

export function onInvitingQRCodeDecoded(result:string){
    let dataJSON:IQRJSON = JSON.parse(result);
    let initDate = new Date(dataJSON.timestamp);
    let now = new Date();
    let durationInMinutes = (now.getTime() - initDate.getTime()) / 1000 / 60;
    if(durationInMinutes > 5){
        //expired
        console.log("already expired");
    }
    else{
        //check wether they are nearby
        if(dataJSON.latitude == dataJSON.longitude && dataJSON.latitude == -1){
            // invalid position, skip validation
            // form a group
            console.log("skip position check. group formed!");
            return;
        }

        processCoordinates((lat:number,long:number)=>{
            if(lat == long && lat == -1){
                // invalid position, skip validation
                // form a group
                console.log("skip position check. group formed!");
                return;
            }
            if(getDistanceBetween(lat,long,dataJSON.latitude,dataJSON.longitude,'K')< 0.5){
                // within 0.5 km
                // valid position, success
                console.log("position check successful. group formed!");
                return;
            }
            else{
                // beyone 0.5 km
                // valid position, fail
                console.log("position check fail. group not formed!");
                return;
            }
        });
    }
}


export function generateQRCodeAddr(content:string,size:string="150x150"):string{
    //https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${content}`;
}



// export function setupQRScanner(video_id:string){
//     $('#changeJoinMethodBtn').html("4 Digit Code");
//     var scanner = new Instascan.Scanner({ video: $( `#${video_id}` )[0] });
//     scanner.addListener('scan', function (content:string) {
//         console.log(content);
//         alert(content);
//     });
//     Instascan.Camera.getCameras().then(function (cameras:any) {
//     if (cameras.length > 0) {
//         scanner.start(cameras[0]);
//     } else {
//         console.error('No cameras found.');
//         alert("no camera");
//     }
//     }).catch(function (e:any) {
//     console.error(e);
//         alert(e);
//     });
// }

