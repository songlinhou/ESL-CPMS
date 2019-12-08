import { isUsernameValid, isStringValid } from "./formatChecker";
import { sendJsonp, displayServerAddr } from "./ajax";
import { generateInvitingQRCodeURL, onInvitingQRCodeDecoded } from "./qr";
import { verifyConversationCode } from "./codeVerify";
import { processCoordinates, ICoordinate } from "./location";
import { waitForScanned, cancelScannedWaiting, setupIOSCamera } from "./scanner";
import { getPlatform } from "./platform";
import { loginUser, logoutUser, showEditPersonalInformation, getUsernameOfUser, getEmailOfUser, syncLocalUserInfo, getFirstNameOfUser, getUserImageURL } from "./credential";
import { showYesNoModal } from "./modal";
import { reviveServer, checkDBStatus } from "./dev";
import { constructFullname } from "./utils";
import { setupDiscussionItemTriggers, setupNewDiscussionModal, setupDiscussionPageTriggers } from "./discussion";
import { setupAnnouncementItemTriggers } from "./annoucement";

let isHTTPS = false;
let isIOS = (localStorage.getItem("isIOS") == "y");
let imageToUpload: any = null;
export let loginInfo:any = null;

declare var firebase: any;


function debugVersion(){
    // console.log("Sat 6:07");
    checkDBStatus();
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
        console.log('loginInfo',loginInfo);
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
        showQRCode();
        showEditPersonalInformation(loginInfo);
        updateLoggedView();
        $('#name_display_in_menu').html(getFirstNameOfUser());
        $('#role_display_in_menu').html(loginInfo.role.toLowerCase());
        roleSpecificFunctions(loginInfo.role);
    }
}

function showQRCode(){
    if(!loginInfo){
        console.log("login first before generating QR code.");
        return;
    }
    let date = new Date();
    let username = getFirstNameOfUser();
    if(!username){
        username = getUsernameOfUser();
    }
    // console.log(getFirstNameOfUser(),getUsernameOfUser());
    //date.getFullYear();
    processCoordinates((lat:number,long:number)=>{
        let position:ICoordinate = {latitude:lat,longitude:long};
        let qrCodeAddr = generateInvitingQRCodeURL(username,position,date.toJSON().toString(),loginInfo.role);
        $('#qrGenerateModal').find('img').attr('src',qrCodeAddr);
    });
}

function updateLoggedView(){
    getUserImageURL((url:string)=>{
        $('#avatar-edit-btn').attr('src',url);
        $('#imageEditPreview').attr('src',url);
    });
}


function roleSpecificFunctions(role:string){
    if(role == 'STUDENT'){
        $('#manageConsoleBtnDivier').hide();
        $('#manageConsoleBtn').hide();
    }
    else{
        $('#manageConsoleBtnDivier').show();
        $('#manageConsoleBtn').show();
    }
}


function setupLoginStatus(){

    displayServerAddr();
    reviveServer();
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
    $('#login_panel>button').on("click",(event)=>{
        // event.preventDefault();
        $('#login_first_error').hide();
        $('#WPI-login-content').show();
        $('#WPI-Reg-content').hide();
        $('#WPI-Verify-content').hide();
        $('#WPI-Password-content').hide();
        $('#email_login_error').html("");
        $('#password_login_error').html("");
        $('#login_credential_error').html("");
    });

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
                    console.log("after login, data=",userData);
                    //get the logged in time
                    let date = new Date();
                    let timestamp = date.getTime();
                    userData['timestamp'] = timestamp;
                    localStorage.setItem("login", JSON.stringify(userData));
                    loginInfo = userData;
                    showQRCode();
                    console.log("login successful!");
                    //update UI
                    $('#login_panel').addClass('d-none');
                    $('#user_panel').removeClass('d-none');
                    login_modal.modal('hide');
                    //now change to logged in mode.
                    updateLoggedView();
                    $('#name_display_in_menu').html(getFirstNameOfUser());
                    $('#role_display_in_menu').html(loginInfo.role.toLowerCase());
                    roleSpecificFunctions(loginInfo.role);
                    $('#reservationBtn').closest("li").show();
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
    
            if(!isUsernameValid(username_input)){
                console.log("error in username");
                //UI show error message
                return;
            }
            
            let email = `${username_input}@wpi.edu`;
            // check database first
            let accountExist = false;
            let errorInDB = false;
            sendJsonp("/account/exist",{"email":email},"post","check_exist").done((resp)=>{
                if(!resp.success){
                    let error = resp.message;
                    errorInDB = true;
                    return;
                }
                if(resp.data){
                    // account exist, return to login view
                    $('#WPI-Reg-content').hide();
                    $('#WPI-Verify-content').hide();
                    $('#WPI-Password-content').hide();
                    $('#wpi-username-login-input').val(username_input);
                    $('#WPI-login-content').fadeIn();
                    $('#email_login_error').html("Please login directly.");
                    accountExist = true;
                    return;
                }
                else{
                    // new account
                    // /request/verification_code
                    console.log("request a verification code for " + username_input);
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
            }).fail((error)=>{
                errorInDB = true;
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
        if(!loginInfo){
            $('#login_panel>button').click();
            $('#login_first_error').show();
            return;
        }
        showQRCode();
        
        $('#qrGenerateModal').modal("show");
        //showCoordinates();
    });

    $('#newTalkMenuBtn').on("click",(e)=>{
        e.preventDefault();
        $('#startConverstionBtn').click();
    });



    $('#joinConversationBtn').on("click",(e)=>{
        e.preventDefault();
        // log in first
        if(!loginInfo){
            $('#login_panel>button').click();
            $('#login_first_error').show();
            return;
        }
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

    $('#joinTalkMenuBtn').on('click',(e)=>{
        e.preventDefault();
        $('#joinConversationBtn').click();
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
    });

    $('#checkRecordMenuBtn').on("click",(e)=>{
        e.preventDefault();
        $('#checkRecordBtn').click();
    });

    $('#conversatonResultExitBtn').on("click",(e)=>{
        //do some cleaning
        e.preventDefault();
        $('#conversatonResultModal').modal("hide");
    });

    $('#startConversationProcessBtn').on('click',(e)=>{
        e.preventDefault();
        console.log("start conversation now!!!");
    });

    $('#reservationBtn').on("click",(e)=>{
        console.log("reservation button");
        $("#scheduleModal").modal("show");
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
    $('#avatar-edit-btn').on('click',(event)=>{
        event.preventDefault();
        $('#avatarEditModal').modal('show');
    });

    function changeAvatar(){
        $('#avatar-size-error').addClass('d-none');
        $('#avatarUpload').click();
        // 1000000
        $('#avatarUpload').off('change');
        $('#avatarUpload').on('change',(event:any)=>{
            let file = event.target.files[0];
            let path = <string>$('#avatarUpload').val();
            let ext = path.split('.').pop();
            ext = ext.toLowerCase();
            if(ext !== 'jpg' && ext !== 'jpeg'){
                $('#avatar-size-error').removeClass('d-none');
                $('#avatarEditSave').attr('disabled','disabled');
                $('#avatar-size-error').html('Only .jpg file is accepted.');
                return;
            }
            console.log(file.size,' bytes');
            if(file.size > 1000000){
                //larger than 1 mb
                $('#avatar-size-error').removeClass('d-none');
                $('#avatarEditSave').attr('disabled','disabled');
                $('#avatar-size-error').html('The maximum size of the image is 1MB');
                return;
            }
            $('#avatarEditSave').removeAttr('disabled');
            let reader  = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = ()=>{
                // console.log(reader.result);
                $('#imageEditPreview').attr('src',<any>reader.result);
                imageToUpload = file;
            };
            // console.log(file);
        });
    }

    $('#imageEditPreview').on('click',(event)=>{
        event.preventDefault();
        changeAvatar();
    });
    $('#avatarUploadBtn').on('click',(event)=>{
        event.preventDefault();
        changeAvatar();
    });

    $('#avatarEditSave').on('click',(event)=>{
        event.preventDefault();
        let path = <string>($('#avatarUpload').val());
        $('#imageUploadProgressBarDiv').addClass('d-none');
        // let ext = path.split('.').pop();
        // console.log('ext:',ext);
        let username = getUsernameOfUser(); 
        let storageRef = firebase.storage().ref(`wpi/${username}.jpg`);
        let task = storageRef.put(imageToUpload);
        $('#imageUploadProgressBarDiv').removeClass('d-none');
        task.on('state_changed',
        (snapshot:any)=>{
            // progress
            let percentage = snapshot.bytesTransferred / snapshot.totalBytes * 100;
            console.log(`Percent:${percentage}%`);
            percentage = Math.floor(percentage);
            $('#imageUploadProgressBarDiv').removeClass('d-none');
            $('#imageUploadProgressBar').css('width', percentage+'%').attr('aria-valuenow', percentage);  
        },(error:any)=>{
            console.log('error occured in uploading',error);
        },()=>{
            //when finished
            console.log("finished!");
            setTimeout(()=>{
                $('#avatarEditModal').modal('hide');
                updateLoggedView();
            },1000);
            //update the avatarID in the account
            let data = {email:getEmailOfUser(),avatarID:-1}
            sendJsonp('/update_avatar',data,'post','updateAvatar').done((resp)=>{
                if(resp.success){
                    //save the local storage
                    loginInfo['avatarID'] = -1;
                    localStorage.setItem("login",JSON.stringify(loginInfo));
                }
                else{
                    console.log("error in update avatar:" + resp.message);
                }
            });
        });
    });

    $('#editPersonalInfoSave').on('click',(event)=>{
        event.preventDefault();
        $('#editPersonalInfoSave').attr('disabled','disabled');
        $('#personal_info_edit_error').html("");
        if(loginInfo.role == 'STUDENT'){
            let firstName = $('#studentFirstNameInput').val();
            let middleName = $('#studentMiddleNameInput').val();
            let lastName = $('#studentLastNameInput').val();
            let major = $('#majorInput').val();
            let country = $('#country_select').val();
            let visible = $('#info_visible_select').val();
            // console.log(firstName,middleName,lastName,major,country,visible);
            let keys = [];
            let values = [];
            
            if(firstName.toString().trim()){
                keys.push("stufirstname");
                values.push(firstName.toString().replace('--',''));
            }
            if(middleName.toString().trim()){
                keys.push("stumidname");
                values.push(middleName.toString().replace('--',''));
            }
            if(lastName.toString().trim()){
                keys.push("stulastname");
                values.push(lastName.toString().replace('--',''));
            }
            if(major.toString().trim()){
                keys.push("major");
                values.push(major.toString().replace('--',''));
            }
            if(country.toString().trim()){
                keys.push("country");
                values.push(country.toString().replace('--',''));
            }
            console.log(keys);
            console.log(values);
            let email = getEmailOfUser();
            let data = {keys:keys.join('--'),values:values.join('--'),email:email,digest:loginInfo.digest}
            sendJsonp('/student/update',data,'post','update_student').done(resp=>{
                if(resp.success){
                    $('#editPersonalInfoModal').modal('hide');
                    syncLocalUserInfo(); // change the local record
                    // update UI
                }
                else{
                    $('#personal_info_edit_error').html(resp.message);
                }
                $('#editPersonalInfoSave').removeAttr('disabled');
            }).fail((resp)=>{
                $('#personal_info_edit_error').html("Error occured on the server. Try again later.");
            });
        }
        else if(loginInfo.role == 'PARTNER'){

        }
        else if(loginInfo.role == 'ADMIN'){

        }
    });

    $('#account-setting-btn').on('click',(event)=>{
        event.preventDefault();
        showEditPersonalInformation(loginInfo,true);
    });

    $('#manageConsoleBtn').on('click',(event)=>{
        event.preventDefault();
        console.log("manageConsoleBtn");
        if(!loginInfo){
            $('#login_panel>button').click();
            $('#login_first_error').show();
            return;
        }
        if(loginInfo.role == 'STUDENT'){
            console.log("no permission");
            return;
        }
        if(loginInfo.role == 'PARTNER'){
            window.open("/console.html");
            return;
        }
        if(loginInfo.role == 'ADMIN'){
            window.open("/console.html");
            return;
        }
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

export function populateDiscussionList(page:number=0,limit:number=5){
    function setupPagination(recordNumInPage:number){
        let html = "";
        sendJsonp('/summary/counts',null,"post","setupDiscussionPagination").done((resp)=>{
            let data = resp.data;
            let discussionNum = -1;
            $.each(data,(index:number,record)=>{
                if(record.type == 'discussion'){
                    discussionNum = record.cnt;
                }
            });
            let disabledClassPrev = '';
            if(page == 0){
                disabledClassPrev = 'disabled';
            }
            
            let liHTML = `<li class="page-item ${disabledClassPrev}">
            <a class="page-link" href="#" tabindex="-1">Previous</a>
            </li>`;
            html += liHTML;
            let requiredPages = Math.ceil(discussionNum/recordNumInPage);
            for(let i=0;i<requiredPages;i++){
                if(i == page)
                    liHTML = `<li class="page-item active"><a class="page-link" href="#">${i+1}</a></li>`;
                else{
                    liHTML = `<li class="page-item"><a class="page-link" href="#">${i+1}</a></li>`;
                }
                html += liHTML;
            }
            let disabledClass = 'disabled';
            if(requiredPages > 1){
                disabledClass = '';
            }
            if(page+1 == requiredPages){
                disabledClass = 'disabled';
            }
            liHTML = `<li class="page-item ${disabledClass}">
            <a class="page-link" href="#" tabindex="-1">Next</a>
            </li>`;
            html += liHTML;
            $('#discussion_allposts_pagination').html(html);
            $('#discussion_allposts_pagination').attr("pageCount",requiredPages);

            setupDiscussionPageTriggers();
        });
    }
    setupPagination(limit);
    let data = {'limit':limit,'page':page};
    function generateDiscussionRecord(discid:number,disctitle:string,discdate:string,authorid:string,authorfirstname:string,authormidname:string,authorlastname:string,imageURL:string){
        let fullName = constructFullname(authorfirstname,authormidname,authorlastname);
        let content = `<a href="#" discid="${discid}" authorid="${authorid}" authorName="${fullName}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
        <span class="one-row"><img style="cursor:pointer; width:30px;height: 30px;"   src="${imageURL}" class="mr-3 avatar-icon avatar-icon-update" alt="...">${disctitle}</span>
        <small class="text-muted d-none d-sm-block">${discdate}</small>
        </a>`;
        return content;
    }
    sendJsonp('/discussion_list',data,'post','get_discussion_list').done((resp)=>{
        let data = resp.data;
        let recordNumber = data.length;
        let htmlList:string[] = [];
        let indexList:number[] = [];
        $.each(data,(index:number,record)=>{
            let avatarID = parseInt(record.avatarID);
            let discid = record.discid;
            let disctitle = record.disctitle;
            let discdate = record.discdate;
            let authorid = record.authorid;
            let authorfirstname = record.authorfirstname;
            let authormidname = record.authormidname;
            let authorlastname = record.authorlastname;
            let username = getUsernameOfUser(authorid);
            let recordHTML = "";
            getUserImageURL((imageURL:string)=>{
                recordHTML = generateDiscussionRecord(discid,disctitle,discdate,authorid,authorfirstname,authormidname,authorlastname,imageURL);
                indexList.push(index);
                htmlList[index] = recordHTML;
            },avatarID,username);
        });
        let intervalHandler = setInterval(()=>{
            if (indexList.length == recordNumber){
                clearInterval(intervalHandler);
                let html = "";
                $.each(htmlList,(index:number,htmlRec:string)=>{
                    html += htmlRec;
                });
                $('#all_discussion_list').html(html);
                setupDiscussionItemTriggers();
            }
        },200);
    });
    setupNewDiscussionModal();
}

function populateAnnouncementList(){
    // /anouncements/all?startIndex=1&endIndex=4
    function generateAnnouncementRecord(annid:number,anntitle:string,timestamp:string){
        let content = `<a href="#" annid="${annid}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center ann_item">
        <span class="one-row">${anntitle}</span>
        <small class="text-muted d-none d-sm-block">${timestamp}</small>
      </a>`;
      return content;
    }
    function setupPagination(recordNumInPage:number){
        let html = "";
        sendJsonp('/summary/counts',null,"post","setupAnnouncementPagination").done((resp)=>{
            let data = resp.data;
            let announcementNum = -1;
            $.each(data,(index:number,record)=>{
                if(record.type == 'announcement'){
                    announcementNum = record.cnt;
                }
            });
            let liHTML = `<li class="page-item disabled">
            <a class="page-link" href="#" tabindex="-1">Previous</a>
            </li>`;
            html += liHTML;
            let requiredPages = Math.ceil(announcementNum/recordNumInPage);
            for(let i=0;i<requiredPages;i++){
                if(i == 0)
                    liHTML = `<li class="page-item active"><a class="page-link" href="#">${i+1}</a></li>`;
                else{
                    liHTML = `<li class="page-item"><a class="page-link" href="#">${i+1}</a></li>`;
                }
                html += liHTML;
            }
            let disabledClass = 'disabled';
            if(requiredPages > 1){
                disabledClass = '';
            }
            if(requiredPages > 1){
                disabledClass = '';
            }
            // if(page+1 == requiredPages){
            //     disabledClass = 'disabled';
            // }
            liHTML = `<li class="page-item ${disabledClass}">
            <a class="page-link" href="#" tabindex="-1">Next</a>
            </li>`;
            html += liHTML;
            $('#annoucement_pagination').html(html);
            $('#annoucement_pagination').attr("pageCount",requiredPages);

        });
    }
    let recordNumInPage = 10;
    setupPagination(recordNumInPage);
    let data = {startIndex:0,endIndex:recordNumInPage+1};
    sendJsonp('/anouncements/all',data,"post","get_announcement")
    .done((resp)=>{
        let html = "";
        $.each(resp['data'],(index,record)=>{
            console.log("index=",index);
            console.log("record=",record);
            let record_html = generateAnnouncementRecord(record['annid'],record['anntitle'],record['anndate']);
            html += record_html;
        });
        $('#anouncement_list').html(html);
        setupAnnouncementItemTriggers();
    });
}

$(document).ready(()=>{
    deviceFix();
    setupLoginStatus();
    setupUserPanelTriggers();
    populateAnnouncementList();
    populateDiscussionList();
});