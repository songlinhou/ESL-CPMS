import { isUsernameValid, isStringValid } from "./formatChecker";
import { sendJsonp, displayServerAddr } from "./ajax";
import { generateInvitingQRCodeURL, onInvitingQRCodeDecoded } from "./qr";
import { verifyConversationCode } from "./codeVerify";
import { processCoordinates, ICoordinate } from "./location";
import { waitForScanned, cancelScannedWaiting, setupIOSCamera } from "./scanner";
import { getPlatform } from "./platform";
import { loginUser, logoutUser, showEditPersonalInformation } from "./credential";
import { showYesNoModal } from "./modal";

let isHTTPS = false;
let isIOS = (localStorage.getItem("isIOS") == "y");
export let loginInfo:any = null;



function debugVersion(){
    console.log("Sat 6:07");
}

function platformInit(){
    if(isIOS){
        $('#scannerHeight').css("height","300px");
        (<any>window).scanner.stop();
        // height="280"
        $('#qr-video').attr("height",280);
        (<any>window).scanner._onDecode = (result:any)=>{
            console.log("captured result",result);
            onInvitingQRCodeDecoded(result);
            (<any>window).scanner.stop();
        }
    }
        
}

export function deleteLocalCredentials(){
    loginInfo = null;
    localStorage.setItem("login","");
}

function getLastLoginInfo(expired_days:number=30){
    let login_json = localStorage.getItem("login");
    if(!login_json){
        $('#login_panel').removeClass('d-none');
        $('#user_panel').addClass('d-none');
        return;
    }

    try {
        loginInfo = JSON.parse(login_json);
    } catch (error) {
        localStorage.setItem("login","");
        $('#login_panel').removeClass('d-none');
        $('#user_panel').addClass('d-none');
        return;
    }
    
    let date = new Date();
    let now = date.getTime();
                    
    if (loginInfo){
        $('#login_panel').addClass('d-none');
        $('#user_panel').removeClass('d-none');
        if('timestamp' in Object.keys(loginInfo)){
            let lastLoginTime = loginInfo['timestamp'];
            let hours = (now - lastLoginTime)/1000/60/60;
            if (hours/24 > expired_days){
                //expired already
                $('#login_panel').removeClass('d-none');
                $('#user_panel').addClass('d-none');
                loginInfo = null;
                localStorage.setItem("login","");
            }
        }
    }
    else{
        localStorage.setItem("login","");
        $('#login_panel').removeClass('d-none');
        $('#user_panel').addClass('d-none');
    }

    if(loginInfo){
        showEditPersonalInformation(loginInfo);
    }
}


function setupLoginStatus(){

    displayServerAddr();
    checkProtocol();
    platformInit();
    // getPlatform();
    debugVersion();
    getLastLoginInfo();
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
            let username:string = ($('#wpi-username-login-input').val()).toString();
            let password:string = ($('#user-login-password-input').val()).toString();
            $('#password_login_error').html("");
            $('#email_login_error').html("");
            $('#login_credential_error').html("");

            if(!isUsernameValid(username)){
                $('#email_login_error').html("email is not valid.");
                return;
            }
            if(!isStringValid(password)){
                $('#password_login_error').html("password cannot be empty.");
                return;
            }
            console.log("start to connect to server");
            let email = `${username}@wpi.edu`;
            loginUser(email,password,
                (resp:any)=>{
                    if(!resp.success){
                        setTimeout(()=>{
                            $('#login_credential_error').html(resp.message);
                        },100);
                        return;
                    }
                    let userData = resp.data;
                    //get the logged in time
                    let date = new Date();
                    let timestamp = date.getTime();
                    userData['timestamp'] = timestamp;
                    localStorage.setItem("login", JSON.stringify(userData));
                    console.log("login successful!");
                    //update UI
                    $('#login_panel').addClass('d-none');
                    $('#user_panel').removeClass('d-none');
                    login_modal.modal('hide');
                    //now change to logged in mode.
            },
            (error:any)=>{
                console.log("server error!");
                console.log(error);
                $('#login_credential_error').html("Server error.");
            });
            //login_modal.modal('hide');
        }
        else if(reg_content.is(":visible")){
            // request a verification code
            let username_input:string = <string>$('#wpi-username-verify-input').val();
            username_input = username_input.trim();
    
            console.log("request a verification code for " + username_input);
            if(!isUsernameValid(username_input)){
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

            //TODO: Ask for addtional information

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
       
        console.log("try scanning");
        $('#qrScannerModal').modal("show");

        if(!isIOS){
            $('#scannerIframe').attr('src','scan.html');
            localStorage.setItem("scanning", "y");
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
        }
        else{
            //IOS
            console.log('setup ios camera now');
            setupIOSCamera((result)=>{
                console.log("captured result",result);
                onInvitingQRCodeDecoded(result);
            });
        }
        
    });

    $('#changeJoinMethodBtn').on("click",(e)=>{
        e.preventDefault();
        // change the method view
        if($("#scannerContent").is(":visible")){
            // change to 4 digit code
            verifyConversationCode();
            if(!isIOS){
                cancelScannedWaiting();
            }
            else{
                (<any>window).scanner.stop();
            }
        }
        else{
            // change to camera
            $("#inputCodeContent").hide();
            $("#scannerContent").fadeIn("slow");
            $('#changeJoinMethodBtn').html("4 Digit Code");
            if(!isIOS){
                $('#scannerIframe').attr('src','scan.html');
                localStorage.setItem("scanning", "y");
                (<any>document.getElementById('scannerIframe')).contentWindow.location.reload();
                localStorage.setItem("qr-result","");
                waitForScanned((result)=>{
                    console.log("captured result",result);
                    onInvitingQRCodeDecoded(result);
                });
            }
            else{
                $('#qr-video').css("object-fit","fill");
                $('#qr-video').attr("height","300");
                console.log('setup ios camera now');
                setupIOSCamera((result)=>{
                    console.log("captured result",result);
                    onInvitingQRCodeDecoded(result);
            });
            }
        }
    });

    $('#qrScannerExitBtn').on("click",(e)=>{
        e.preventDefault();
        console.log("stop current scanner");
        
        $('#qrScannerModal').modal("hide");
        if(!isIOS){
            cancelScannedWaiting();
        }
        else{
            (<any>window).scanner.stop();
        }
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

function setupUserPanelTriggers(){
    $('#logout_btn').on('click',(event)=>{
        event.preventDefault();
        let buttonPos = $('#logout_btn').position();
        console.log('buttonPos',buttonPos);
        showYesNoModal("Logout","Are you sure you want to log out?",()=>{
            logoutUser();
            console.log("logout successfully");
        },
        ()=>{
            console.log("logout cancelled");
        });
        
    });
}

function deviceFix(){
    $('#dropdownMenuButton').on('click',()=>{
        let offset = $('#dropdownMenuButton').offset();
        if(offset.top > offset.left){
            // dropdown-menu-right
            $('#user-panel-dropdown').removeClass('dropdown-menu-right');
        }
        else{
            $('#user-panel-dropdown').addClass('dropdown-menu-right');
        }
    });
    

}

$(document).ready(()=>{
    deviceFix();
    setupLoginStatus();
    setupUserPanelTriggers();
});