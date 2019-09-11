"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var formatChecker_1 = require("./formatChecker");
var ajax_1 = require("./ajax");
var qr_1 = require("./qr");
var codeVerify_1 = require("./codeVerify");
var location_1 = require("./location");
var scanner_1 = require("./scanner");
var isHTTPS = false;
function debugVersion() {
    console.log("wed 12:11");
}
function setupLoginStatus() {
    checkProtocol();
    // getPlatform();
    debugVersion();
    scanner_1.pause_scanner();
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
            login_modal.modal('hide');
        }
        else if (reg_content.is(":visible")) {
            // request a verification code
            var username_input = $('#wpi-username-verify-input').val();
            username_input = username_input.trim();
            console.log("request a verification code for " + username_input);
            if (!formatChecker_1.isInputValid(username_input)) {
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
        //setupQRScanner('scanner');
        console.log("try scanning");
        $('#qrScannerModal').modal("show");
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
    });
    $('#changeJoinMethodBtn').on("click", function (e) {
        e.preventDefault();
        // change the method view
        if ($("#scannerContent").is(":visible")) {
            // change to 4 digit code
            codeVerify_1.verifyConversationCode();
            scanner_1.cancelScannedWaiting();
        }
        else {
            // change to camera
            $("#inputCodeContent").hide();
            $("#scannerContent").fadeIn("slow");
            $('#changeJoinMethodBtn').html("4 Digit Code");
            // (<any>window).scanner.start();
            $('#qr-video').css("object-fit", "fill");
            $('#qr-video').attr("height", "300");
            localStorage.setItem("qr-result", "");
            scanner_1.waitForScanned(function (result) {
                console.log("captured result", result);
                qr_1.onInvitingQRCodeDecoded(result);
            });
        }
    });
    $('#qrScannerExitBtn').on("click", function (e) {
        e.preventDefault();
        console.log("stop current scanner");
        scanner_1.cancelScannedWaiting();
        // (<any>window).scanner.stop();
        $('#qrScannerModal').modal("hide");
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
$(document).ready(function () {
    setupLoginStatus();
});
//# sourceMappingURL=app.js.map