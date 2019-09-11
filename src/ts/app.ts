import { isInputValid } from "./formatChecker";
import { sendJsonp } from "./ajax";
import { generateInvitingQRCodeURL, onInvitingQRCodeDecoded } from "./qr";
import { verifyConversationCode } from "./codeVerify";
import { processCoordinates, ICoordinate } from "./location";
import { setup_camera, waitForScanned, cancelScannedWaiting } from "./scanner";
import { getPlatform } from "./platform";

let isHTTPS = false;

function debugVersion(){
    console.log("wed 12:18");
}


function setupLoginStatus(){
    checkProtocol();
    // getPlatform();
    debugVersion();
    let login_modal = $("#loginModal");
    let login_content = $('#WPI-login-content');
    let reg_content = $('#WPI-Reg-content');
    let verify_content = $('#WPI-Verify-content');
    let password_content = $('#WPI-Password-content');
    login_content.show();
    reg_content.hide();
    verify_content.hide();
    password_content.hide();
    $('#login-reg-confirm').html("Login");

    // set up event triggers
    $('#login-reg-confirm').on("click",()=>{
        if(login_content.is(":visible")){
            // start to login
            console.log("start to login with email and password");
            login_modal.modal('hide');
        }
        else if(reg_content.is(":visible")){
            // request a verification code
            let username_input:string = <string>$('#wpi-username-verify-input').val();
            username_input = username_input.trim();
    
            console.log("request a verification code for " + username_input);
            if(!isInputValid(username_input)){
                console.log("error in username");
                //UI show error message
                return;
            }
            
            let email = `${username_input}@wpi.edu`;
            // /request/verification_code
            sendJsonp("/request/verification_code",{"email":email},"post","request_verification_code").done((resp)=>{
                console.log("verification code status",resp);
                if (resp.success){
                    //go to set up password for current user.
                    login_content.hide();
                    reg_content.hide();
                    password_content.hide();
                    verify_content.fadeIn("slow");
                }
                else{
                    //wrong verification code
                    console.log("wrong verification code");
                    return;
                }
            }).fail((resp)=>{
                console.log("verification code request failed","email=",email,resp);
            });

        }
        else if(verify_content.is(":visible")){
            // verify the verification code
            console.log("verify the verification code");
            let verification_code = <string>$('#verification-code-input').val();
            verification_code = verification_code.trim();
            if(verification_code.length != 4){
                console.log("bad input");
                return;
            }
            let number = parseInt(verification_code);
            if(number < 1000 || number >= 10000){
                console.log("4 digit is required");
                return;
            }
            console.log("start to verify");

            // /verify/code?code=9017
            sendJsonp("/verify/code",{'code':number},"get","verify_code").done((resp)=>{
                console.log("verify result",resp);
                if(resp.success){
                    console.log("verification passed");
                    // now we are sure the user is valid, update status/UI, user can set password now.
                    login_content.hide();
                    reg_content.hide();
                    verify_content.hide();
                    password_content.fadeIn("slow");
                   
                }
                else{
                    console.log("verification code not found.");
                }
            }).fail((resp)=>{
                console.log("fail",resp);
            });
        }
        else if(password_content.is(":visible")){
            //set up password
            console.log("setup password here");
            let password:string = <string>$('#password-set-input').val();
            let passConfirm:string = <string>$('#password-repeat-input').val();
            password = password.trim();
            passConfirm = passConfirm.trim();
            if(password.length < 8){
                console.log("password should be at least 8 digits");
                //update the UI
                return;
            }
            if(password != passConfirm){
                console.log("unmatched password");
                //update the UI
                return;
            }
            console.log("the password is set to",password);
        }

    });

    $('.go-to-reg').on("click",()=>{
        login_content.hide();
        verify_content.hide();
        password_content.hide();
        reg_content.fadeIn("slow");
        $('#login-reg-confirm').html("Verify");
    });

    $('.go-to-login').on("click",()=>{
        reg_content.hide();
        verify_content.hide();
        password_content.hide();
        login_content.fadeIn("slow");
        $('#login-reg-confirm').html("Login");
    });

    $('#startConverstionBtn').on("click",(e)=>{
        e.preventDefault();
        let date = new Date();
        //date.getFullYear();
        processCoordinates((lat:number,long:number)=>{
            let position:ICoordinate = {latitude:lat,longitude:long};
            let qrCodeAddr = generateInvitingQRCodeURL("Ray",position,date.toJSON().toString());
            $('#qrGenerateModal').find('img').attr('src',qrCodeAddr);
        });
        
        $('#qrGenerateModal').modal("show");
        //showCoordinates();
    });

    $('#joinConversationBtn').on("click",(e)=>{
        e.preventDefault();
        // setup QR scanner
        
        $("#scannerContent").show();
        $("#inputCodeContent").hide();
        //setupQRScanner('scanner');
        console.log("try scanning");
        $('#qrScannerModal').modal("show");
        $('#scannerIframe').attr('src','scan.html');
        (<any>document.getElementById('scannerIframe')).contentWindow.location.reload();
        try {
            localStorage.setItem("qr-result","");
            waitForScanned((result)=>{
                console.log("captured result",result);
                onInvitingQRCodeDecoded(result);
            });
        } catch (error) {
            console.log("camera not supported",error);
            cancelScannedWaiting();
        }
        
    });

    $('#changeJoinMethodBtn').on("click",(e)=>{
        e.preventDefault();
        // change the method view
        if($("#scannerContent").is(":visible")){
            // change to 4 digit code
            verifyConversationCode();
            cancelScannedWaiting();
        }
        else{
            // change to camera
            $("#inputCodeContent").hide();
            $("#scannerContent").fadeIn("slow");
            $('#scannerIframe').attr('src','scan.html');
            (<any>document.getElementById('scannerIframe')).contentWindow.location.reload();
            $('#changeJoinMethodBtn').html("4 Digit Code");
            // (<any>window).scanner.start();
            $('#qr-video').css("object-fit","fill");
            $('#qr-video').attr("height","300");
            localStorage.setItem("qr-result","");
            waitForScanned((result)=>{
                console.log("captured result",result);
                onInvitingQRCodeDecoded(result);
            });
        }
    });

    $('#qrScannerExitBtn').on("click",(e)=>{
        e.preventDefault();
        console.log("stop current scanner");
        cancelScannedWaiting();
        // (<any>window).scanner.stop();
        $('#qrScannerModal').modal("hide");
    });

    $('#checkRecordBtn').on("click",(e)=>{
        e.preventDefault();
        $('#conversatonResultModal').modal("show");
    })

    $('#conversatonResultExitBtn').on("click",(e)=>{
        //do some cleaning
        e.preventDefault();
        $('#conversatonResultModal').modal("hide");
    });

    $('#startConversationProcessBtn').on('click',(e)=>{
        e.preventDefault();
        console.log("start conversation now!!!");
    });

}


function checkProtocol(){
    if(window.location.protocol == "http:"){
        isHTTPS = false;
    }
    else if(window.location.protocol == "https:"){
        isHTTPS = true;
    }
    else{
        console.log("unknow protocol");
    }
}


$(document).ready(()=>{
    setupLoginStatus();
});