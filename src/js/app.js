"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var formatChecker_1 = require("./formatChecker");
var ajax_1 = require("./ajax");
var qr_1 = require("./qr");
var codeVerify_1 = require("./codeVerify");
var location_1 = require("./location");
var scanner_1 = require("./scanner");
var credential_1 = require("./credential");
var modal_1 = require("./modal");
var isHTTPS = false;
var isIOS = (localStorage.getItem("isIOS") == "y");
var imageToUpload = null;
exports.loginInfo = null;
function debugVersion() {
    console.log("Sat 6:07");
}
function platformInit() {
    if (isIOS) {
        $('#scannerHeight').css("height", "300px");
        window.scanner.stop();
        // height="280"
        $('#qr-video').attr("height", 280);
        window.scanner._onDecode = function (result) {
            console.log("captured result", result);
            qr_1.onInvitingQRCodeDecoded(result);
            window.scanner.stop();
        };
    }
}
function deleteLocalCredentials() {
    exports.loginInfo = null;
    localStorage.setItem("login", "");
}
exports.deleteLocalCredentials = deleteLocalCredentials;
function getLastLoginInfo(expired_days) {
    if (expired_days === void 0) { expired_days = 30; }
    var login_json = localStorage.getItem("login");
    if (!login_json) {
        $('#login_panel').removeClass('d-none');
        $('#user_panel').addClass('d-none');
        return;
    }
    try {
        exports.loginInfo = JSON.parse(login_json);
        console.log('loginInfo', exports.loginInfo);
    }
    catch (error) {
        localStorage.setItem("login", "");
        $('#login_panel').removeClass('d-none');
        $('#user_panel').addClass('d-none');
        return;
    }
    var date = new Date();
    var now = date.getTime();
    if (exports.loginInfo) {
        $('#login_panel').addClass('d-none');
        $('#user_panel').removeClass('d-none');
        if ('timestamp' in Object.keys(exports.loginInfo)) {
            var lastLoginTime = exports.loginInfo['timestamp'];
            var hours = (now - lastLoginTime) / 1000 / 60 / 60;
            if (hours / 24 > expired_days) {
                //expired already
                $('#login_panel').removeClass('d-none');
                $('#user_panel').addClass('d-none');
                exports.loginInfo = null;
                localStorage.setItem("login", "");
            }
        }
    }
    else {
        localStorage.setItem("login", "");
        $('#login_panel').removeClass('d-none');
        $('#user_panel').addClass('d-none');
    }
    if (exports.loginInfo) {
        showQRCode();
        credential_1.showEditPersonalInformation(exports.loginInfo);
    }
}
function showQRCode() {
    if (!exports.loginInfo) {
        console.log("login first before generating QR code.");
        return;
    }
    var date = new Date();
    var username = credential_1.getFirstNameOfUser();
    //date.getFullYear();
    location_1.processCoordinates(function (lat, long) {
        var position = { latitude: lat, longitude: long };
        var qrCodeAddr = qr_1.generateInvitingQRCodeURL(username, position, date.toJSON().toString(), exports.loginInfo.role);
        $('#qrGenerateModal').find('img').attr('src', qrCodeAddr);
    });
}
function setupLoginStatus() {
    ajax_1.displayServerAddr();
    checkProtocol();
    platformInit();
    // getPlatform();
    debugVersion();
    getLastLoginInfo();
    var login_modal = $("#loginModal");
    var login_content = $('#WPI-login-content');
    var reg_content = $('#WPI-Reg-content');
    var verify_content = $('#WPI-Verify-content');
    var password_content = $('#WPI-Password-content');
    login_content.show();
    reg_content.hide();
    verify_content.hide();
    password_content.hide();
    $('#login-reg-confirm').html("Login");
    $('#login_panel>button').on("click", function (event) {
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
    $('#login-reg-confirm').on("click", function () {
        if (login_content.is(":visible")) {
            // start to login
            console.log("start to login with email and password");
            var username = ($('#wpi-username-login-input').val()).toString();
            var password = ($('#user-login-password-input').val()).toString();
            $('#password_login_error').html("");
            $('#email_login_error').html("");
            $('#login_credential_error').html("");
            if (!formatChecker_1.isUsernameValid(username)) {
                $('#email_login_error').html("email is not valid.");
                return;
            }
            if (!formatChecker_1.isStringValid(password)) {
                $('#password_login_error').html("password cannot be empty.");
                return;
            }
            console.log("start to connect to server");
            var email = username + "@wpi.edu";
            credential_1.loginUser(email, password, function (resp) {
                if (!resp.success) {
                    setTimeout(function () {
                        $('#login_credential_error').html(resp.message);
                    }, 100);
                    return;
                }
                var userData = resp.data;
                //get the logged in time
                var date = new Date();
                var timestamp = date.getTime();
                userData['timestamp'] = timestamp;
                localStorage.setItem("login", JSON.stringify(userData));
                exports.loginInfo = userData;
                showQRCode();
                console.log("login successful!");
                //update UI
                $('#login_panel').addClass('d-none');
                $('#user_panel').removeClass('d-none');
                login_modal.modal('hide');
                //now change to logged in mode.
            }, function (error) {
                console.log("server error!");
                console.log(error);
                $('#login_credential_error').html("Server error.");
            });
            //login_modal.modal('hide');
        }
        else if (reg_content.is(":visible")) {
            // request a verification code
            var username_input_1 = $('#wpi-username-verify-input').val();
            username_input_1 = username_input_1.trim();
            if (!formatChecker_1.isUsernameValid(username_input_1)) {
                console.log("error in username");
                //UI show error message
                return;
            }
            var email_1 = username_input_1 + "@wpi.edu";
            // check database first
            var accountExist_1 = false;
            var errorInDB_1 = false;
            ajax_1.sendJsonp("/account/exist", { "email": email_1 }, "post", "check_exist").done(function (resp) {
                if (!resp.success) {
                    var error = resp.message;
                    errorInDB_1 = true;
                    return;
                }
                if (resp.data) {
                    // account exist, return to login view
                    $('#WPI-Reg-content').hide();
                    $('#WPI-Verify-content').hide();
                    $('#WPI-Password-content').hide();
                    $('#wpi-username-login-input').val(username_input_1);
                    $('#WPI-login-content').fadeIn();
                    $('#email_login_error').html("Please login directly.");
                    accountExist_1 = true;
                    return;
                }
                else {
                    // new account
                    // /request/verification_code
                    console.log("request a verification code for " + username_input_1);
                    ajax_1.sendJsonp("/request/verification_code", { "email": email_1 }, "post", "request_verification_code").done(function (resp) {
                        console.log("verification code status", resp);
                        if (resp.success) {
                            //go to set up password for current user.
                            login_content.hide();
                            reg_content.hide();
                            password_content.hide();
                            verify_content.fadeIn("slow");
                        }
                        else {
                            //wrong verification code
                            console.log("wrong verification code");
                            return;
                        }
                    }).fail(function (resp) {
                        console.log("verification code request failed", "email=", email_1, resp);
                    });
                }
            }).fail(function (error) {
                errorInDB_1 = true;
            });
        }
        else if (verify_content.is(":visible")) {
            // verify the verification code
            console.log("verify the verification code");
            var verification_code = $('#verification-code-input').val();
            verification_code = verification_code.trim();
            if (verification_code.length != 4) {
                console.log("bad input");
                return;
            }
            var number = parseInt(verification_code);
            if (number < 1000 || number >= 10000) {
                console.log("4 digit is required");
                return;
            }
            console.log("start to verify");
            // /verify/code?code=9017
            ajax_1.sendJsonp("/verify/code", { 'code': number }, "get", "verify_code").done(function (resp) {
                console.log("verify result", resp);
                if (resp.success) {
                    console.log("verification passed");
                    // now we are sure the user is valid, update status/UI, user can set password now.
                    login_content.hide();
                    reg_content.hide();
                    verify_content.hide();
                    password_content.fadeIn("slow");
                }
                else {
                    console.log("verification code not found.");
                }
            }).fail(function (resp) {
                console.log("fail", resp);
            });
        }
        else if (password_content.is(":visible")) {
            //set up password
            console.log("setup password here");
            var password = $('#password-set-input').val();
            var passConfirm = $('#password-repeat-input').val();
            password = password.trim();
            passConfirm = passConfirm.trim();
            if (password.length < 8) {
                console.log("password should be at least 8 digits");
                //update the UI
                return;
            }
            if (password != passConfirm) {
                console.log("unmatched password");
                //update the UI
                return;
            }
            console.log("the password is set to", password);
            //TODO: Ask for addtional information
        }
    });
    $('.go-to-reg').on("click", function () {
        login_content.hide();
        verify_content.hide();
        password_content.hide();
        reg_content.fadeIn("slow");
        $('#login-reg-confirm').html("Verify");
    });
    $('.go-to-login').on("click", function () {
        reg_content.hide();
        verify_content.hide();
        password_content.hide();
        login_content.fadeIn("slow");
        $('#login-reg-confirm').html("Login");
    });
    $('#startConverstionBtn').on("click", function (e) {
        e.preventDefault();
        if (!exports.loginInfo) {
            $('#login_panel>button').click();
            $('#login_first_error').show();
            return;
        }
        showQRCode();
        $('#qrGenerateModal').modal("show");
        //showCoordinates();
    });
    $('#joinConversationBtn').on("click", function (e) {
        e.preventDefault();
        // log in first
        if (!exports.loginInfo) {
            $('#login_panel>button').click();
            $('#login_first_error').show();
            return;
        }
        // setup QR scanner
        $("#scannerContent").show();
        $("#inputCodeContent").hide();
        console.log("try scanning");
        $('#qrScannerModal').modal("show");
        if (!isIOS) {
            $('#scannerIframe').attr('src', 'scan.html');
            localStorage.setItem("scanning", "y");
            document.getElementById('scannerIframe').contentWindow.location.reload();
            try {
                localStorage.setItem("qr-result", "");
                scanner_1.waitForScanned(function (result) {
                    console.log("captured result", result);
                    qr_1.onInvitingQRCodeDecoded(result);
                });
            }
            catch (error) {
                console.log("camera not supported", error);
                scanner_1.cancelScannedWaiting();
            }
        }
        else {
            //IOS
            console.log('setup ios camera now');
            scanner_1.setupIOSCamera(function (result) {
                console.log("captured result", result);
                qr_1.onInvitingQRCodeDecoded(result);
            });
        }
    });
    $('#changeJoinMethodBtn').on("click", function (e) {
        e.preventDefault();
        // change the method view
        if ($("#scannerContent").is(":visible")) {
            // change to 4 digit code
            codeVerify_1.verifyConversationCode();
            if (!isIOS) {
                scanner_1.cancelScannedWaiting();
            }
            else {
                window.scanner.stop();
            }
        }
        else {
            // change to camera
            $("#inputCodeContent").hide();
            $("#scannerContent").fadeIn("slow");
            $('#changeJoinMethodBtn').html("4 Digit Code");
            if (!isIOS) {
                $('#scannerIframe').attr('src', 'scan.html');
                localStorage.setItem("scanning", "y");
                document.getElementById('scannerIframe').contentWindow.location.reload();
                localStorage.setItem("qr-result", "");
                scanner_1.waitForScanned(function (result) {
                    console.log("captured result", result);
                    qr_1.onInvitingQRCodeDecoded(result);
                });
            }
            else {
                $('#qr-video').css("object-fit", "fill");
                $('#qr-video').attr("height", "300");
                console.log('setup ios camera now');
                scanner_1.setupIOSCamera(function (result) {
                    console.log("captured result", result);
                    qr_1.onInvitingQRCodeDecoded(result);
                });
            }
        }
    });
    $('#qrScannerExitBtn').on("click", function (e) {
        e.preventDefault();
        console.log("stop current scanner");
        $('#qrScannerModal').modal("hide");
        if (!isIOS) {
            scanner_1.cancelScannedWaiting();
        }
        else {
            window.scanner.stop();
        }
    });
    $('#checkRecordBtn').on("click", function (e) {
        e.preventDefault();
        $('#conversatonResultModal').modal("show");
    });
    $('#conversatonResultExitBtn').on("click", function (e) {
        //do some cleaning
        e.preventDefault();
        $('#conversatonResultModal').modal("hide");
    });
    $('#startConversationProcessBtn').on('click', function (e) {
        e.preventDefault();
        console.log("start conversation now!!!");
    });
}
function checkProtocol() {
    if (window.location.protocol == "http:") {
        isHTTPS = false;
    }
    else if (window.location.protocol == "https:") {
        isHTTPS = true;
    }
    else {
        console.log("unknow protocol");
    }
}
function setupUserPanelTriggers() {
    $('#logout_btn').on('click', function (event) {
        event.preventDefault();
        var buttonPos = $('#logout_btn').position();
        console.log('buttonPos', buttonPos);
        modal_1.showYesNoModal("Logout", "Are you sure you want to log out?", function () {
            credential_1.logoutUser();
            console.log("logout successfully");
        }, function () {
            console.log("logout cancelled");
        });
    });
    $('#avatar-edit-btn').on('click', function (event) {
        event.preventDefault();
        $('#avatarEditModal').modal('show');
    });
    function changeAvatar() {
        $('#avatar-size-error').addClass('d-none');
        $('#avatarUpload').click();
        // 1000000
        $('#avatarUpload').off('change');
        $('#avatarUpload').on('change', function (event) {
            var file = event.target.files[0];
            var path = $('#avatarUpload').val();
            var ext = path.split('.').pop();
            ext = ext.toLowerCase();
            if (ext !== 'jpg' && ext !== 'jpeg') {
                $('#avatar-size-error').removeClass('d-none');
                $('#avatarEditSave').attr('disabled', 'disabled');
                $('#avatar-size-error').html('Only .jpg file is accepted.');
                return;
            }
            console.log(file.size, ' bytes');
            if (file.size > 1000000) {
                //larger than 1 mb
                $('#avatar-size-error').removeClass('d-none');
                $('#avatarEditSave').attr('disabled', 'disabled');
                $('#avatar-size-error').html('The maximum size of the image is 1MB');
                return;
            }
            $('#avatarEditSave').removeAttr('disabled');
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function () {
                // console.log(reader.result);
                $('#imageEditPreview').attr('src', reader.result);
                imageToUpload = file;
            };
            // console.log(file);
        });
    }
    $('#imageEditPreview').on('click', function (event) {
        event.preventDefault();
        changeAvatar();
    });
    $('#avatarUploadBtn').on('click', function (event) {
        event.preventDefault();
        changeAvatar();
    });
    $('#avatarEditSave').on('click', function (event) {
        event.preventDefault();
        var path = ($('#avatarUpload').val());
        $('#imageUploadProgressBarDiv').addClass('d-none');
        // let ext = path.split('.').pop();
        // console.log('ext:',ext);
        var username = credential_1.getUsernameOfUser();
        var storageRef = firebase.storage().ref("wpi/" + username + ".jpg");
        var task = storageRef.put(imageToUpload);
        $('#imageUploadProgressBarDiv').removeClass('d-none');
        task.on('state_changed', function (snapshot) {
            // progress
            var percentage = snapshot.bytesTransferred / snapshot.totalBytes * 100;
            console.log("Percent:" + percentage + "%");
            percentage = Math.floor(percentage);
            $('#imageUploadProgressBarDiv').removeClass('d-none');
            $('#imageUploadProgressBar').css('width', percentage + '%').attr('aria-valuenow', percentage);
        }, function (error) {
            console.log('error occured in uploading', error);
        }, function () {
            //when finished
            console.log("finished!");
            setTimeout(function () {
                $('#avatarEditModal').modal('hide');
            }, 1000);
        });
    });
    $('#editPersonalInfoSave').on('click', function (event) {
        event.preventDefault();
        $('#editPersonalInfoSave').attr('disabled', 'disabled');
        $('#personal_info_edit_error').html("");
        if (exports.loginInfo.role == 'STUDENT') {
            var firstName = $('#studentFirstNameInput').val();
            var middleName = $('#studentMiddleNameInput').val();
            var lastName = $('#studentLastNameInput').val();
            var major = $('#majorInput').val();
            var country = $('#country_select').val();
            var visible = $('#info_visible_select').val();
            // console.log(firstName,middleName,lastName,major,country,visible);
            var keys = [];
            var values = [];
            if (firstName.toString().trim()) {
                keys.push("stufirstname");
                values.push(firstName.toString().replace('--', ''));
            }
            if (middleName.toString().trim()) {
                keys.push("stumidname");
                values.push(middleName.toString().replace('--', ''));
            }
            if (lastName.toString().trim()) {
                keys.push("stulastname");
                values.push(lastName.toString().replace('--', ''));
            }
            if (major.toString().trim()) {
                keys.push("major");
                values.push(major.toString().replace('--', ''));
            }
            if (country.toString().trim()) {
                keys.push("country");
                values.push(country.toString().replace('--', ''));
            }
            console.log(keys);
            console.log(values);
            var email = credential_1.getEmailOfUser();
            var data = { keys: keys.join('--'), values: values.join('--'), email: email, digest: exports.loginInfo.digest };
            ajax_1.sendJsonp('/student/update', data, 'post', 'update_student').done(function (resp) {
                if (resp.success) {
                    $('#editPersonalInfoModal').modal('hide');
                    credential_1.syncLocalUserInfo(); // change the local record
                    // update UI
                }
                else {
                    $('#personal_info_edit_error').html(resp.message);
                }
                $('#editPersonalInfoSave').removeAttr('disabled');
            }).fail(function (resp) {
                $('#personal_info_edit_error').html("Error occured on the server. Try again later.");
            });
        }
        else if (exports.loginInfo.role == 'PARTNER') {
        }
        else if (exports.loginInfo.role == 'ADMIN') {
        }
    });
    $('#account-setting-btn').on('click', function (event) {
        event.preventDefault;
        credential_1.showEditPersonalInformation(exports.loginInfo, true);
    });
}
function deviceFix() {
    $('#dropdownMenuButton').on('click', function () {
        var offset = $('#dropdownMenuButton').offset();
        if (offset.top > offset.left) {
            // dropdown-menu-right
            $('#user-panel-dropdown').removeClass('dropdown-menu-right');
        }
        else {
            $('#user-panel-dropdown').addClass('dropdown-menu-right');
        }
    });
}
$(document).ready(function () {
    deviceFix();
    setupLoginStatus();
    setupUserPanelTriggers();
});
//# sourceMappingURL=app.js.map