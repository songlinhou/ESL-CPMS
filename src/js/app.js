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
        credential_1.showEditPersonalInformation(exports.loginInfo);
    }
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
            var username_input = $('#wpi-username-verify-input').val();
            username_input = username_input.trim();
            console.log("request a verification code for " + username_input);
            if (!formatChecker_1.isUsernameValid(username_input)) {
                console.log("error in username");
                //UI show error message
                return;
            }
            var email_1 = username_input + "@wpi.edu";
            // /request/verification_code
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
        var date = new Date();
        //date.getFullYear();
        location_1.processCoordinates(function (lat, long) {
            var position = { latitude: lat, longitude: long };
            var qrCodeAddr = qr_1.generateInvitingQRCodeURL("Ray", position, date.toJSON().toString());
            $('#qrGenerateModal').find('img').attr('src', qrCodeAddr);
        });
        $('#qrGenerateModal').modal("show");
        //showCoordinates();
    });
    $('#joinConversationBtn').on("click", function (e) {
        e.preventDefault();
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