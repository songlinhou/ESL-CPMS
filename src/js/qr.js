"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var location_1 = require("./location");
var credential_1 = require("./credential");
;
function generateInvitingQRCodeURL(username, location, timestamp, role, size) {
    if (size === void 0) { size = "150x150"; }
    var email = credential_1.getEmailOfUser();
    var dataJSON = {
        appname: "ESL-CPMS",
        username: username,
        latitude: location.latitude,
        longitude: location.longitude,
        email: email,
        role: role,
        timestamp: timestamp
    };
    return generateQRCodeAddr(JSON.stringify(dataJSON), size);
}
exports.generateInvitingQRCodeURL = generateInvitingQRCodeURL;
function onInvitingQRCodeDecoded(result) {
    var dataJSON = JSON.parse(result);
    var initDate = new Date(dataJSON.timestamp);
    var now = new Date();
    var durationInMinutes = (now.getTime() - initDate.getTime()) / 1000 / 60;
    if (durationInMinutes > 5) {
        //expired
        $('#debugGroupInfo').html("expried already");
        $('#qrScannerModal').modal("hide");
        $('#conversatonResultModal').modal("show");
        console.log("already expired");
    }
    else {
        //check wether they are nearby
        if (dataJSON.latitude == dataJSON.longitude && dataJSON.latitude == -1) {
            // invalid position, skip validation
            // form a group
            console.log("skip position check. group formed!");
            $('#debugGroupInfo').html("positions from both devices are not enabled;");
            $('#qrScannerModal').modal("hide");
            $('#conversatonResultModal').modal("show");
            return;
        }
        location_1.processCoordinates(function (lat, long) {
            if (lat == long && lat == -1) {
                // invalid position, skip validation
                // form a group
                console.log("skip position check. group formed!");
                $('#debugGroupInfo').html("positions from one device is not enabled;");
                $('#qrScannerModal').modal("hide");
                $('#conversatonResultModal').modal("show");
                return;
            }
            var distanceInKM = location_1.getDistanceBetween(lat, long, dataJSON.latitude, dataJSON.longitude, 'K');
            console.log("user distance (km)", distanceInKM);
            if (distanceInKM < 0.5) {
                // within 0.5 km
                // valid position, success
                console.log("position check successful. group formed!");
                $('#debugGroupInfo').html("positions check successful;");
                $('#qrScannerModal').modal("hide");
                $('#conversatonResultModal').modal("show");
                return;
            }
            else {
                // beyone 0.5 km
                // valid position, fail
                console.log("position check fail. group not formed!");
                $('#debugGroupInfo').html("positions check failed!!");
                $('#qrScannerModal').modal("hide");
                $('#conversatonResultModal').modal("show");
                return;
            }
        });
    }
}
exports.onInvitingQRCodeDecoded = onInvitingQRCodeDecoded;
function generateQRCodeAddr(content, size) {
    if (size === void 0) { size = "150x150"; }
    //https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example
    return "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "&data=" + content;
}
exports.generateQRCodeAddr = generateQRCodeAddr;
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
//# sourceMappingURL=qr.js.map