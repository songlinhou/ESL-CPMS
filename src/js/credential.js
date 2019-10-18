"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ajax_1 = require("./ajax");
var app_1 = require("./app");
var countryList_1 = require("./countryList");
var modal_1 = require("./modal");
function loginUser(email, password, onData, onError) {
    //http://127.0.0.1:8888/account/login?email=wd@wpi.edu&password=12345678&callback=login_callback
    var url = '/account/login';
    var data = {
        email: email,
        password: password
    };
    ajax_1.sendJsonp(url, data, 'post', 'login').done((function (resp) {
        if (!resp.success) {
            console.log(resp.message);
        }
        onData(resp);
    })).fail(function (resp) {
        onError(resp);
    });
}
exports.loginUser = loginUser;
function logoutUser() {
    app_1.deleteLocalCredentials();
    $('#login_panel').removeClass('d-none');
    $('#user_panel').addClass('d-none');
}
exports.logoutUser = logoutUser;
function generateCountryListHTML() {
    var countries = countryList_1.world_countries['countries'];
    var html = "";
    $.each(countries, function (index, countryItem) {
        var country = countryItem['country'];
        // console.log(countryItem,index);
        var option = "<option>" + country + "</option>";
        html += option;
    });
    return html;
}
function getEmailOfUser() {
    var email = null;
    if (app_1.loginInfo.role == 'STUDENT') {
        email = app_1.loginInfo.stuid;
    }
    else if (app_1.loginInfo.role == 'PARTNER') {
        email = app_1.loginInfo.cpid;
    }
    else if (app_1.loginInfo.role == 'ADMIN') {
        email = app_1.loginInfo.adminid;
    }
    return email;
}
exports.getEmailOfUser = getEmailOfUser;
function getUsernameOfUser() {
    var email = getEmailOfUser();
    var name = email.split('@')[0];
    return name.trim();
}
exports.getUsernameOfUser = getUsernameOfUser;
function showEditPersonalInformation(loginInfo) {
    //check if all the fields are filled
    var showEditModal = false;
    $.each(loginInfo, function (field, value) {
        if (!value) {
            showEditModal = true;
        }
    });
    if (!showEditModal) {
        return;
    }
    var email = "unknown";
    if (loginInfo.role == 'STUDENT') {
        email = loginInfo.stuid;
        $('#adminInfoForm').addClass('d-none');
        $('#studentAndPartnerInfoForm').removeClass('d-none');
    }
    else if (loginInfo.role == 'PARTNER') {
        email = loginInfo.cpid;
        $('#adminInfoForm').addClass('d-none');
        $('#studentAndPartnerInfoForm').removeClass('d-none');
    }
    else if (loginInfo.role == 'ADMIN') {
        email = loginInfo.adminid;
        $('#adminInfoForm').removeClass('d-none');
        $('#studentAndPartnerInfoForm').addClass('d-none');
    }
    $('#userEmailAddressReadonly').attr('placeholder', email);
    $('#adminEmailAddressReadonly').attr('placeholder', email);
    $('#country_select').html(generateCountryListHTML());
    $('#editPersonalInfoModal').modal('show');
    $('#editPersonalInfoDiscard').on('click', function () {
        $('#editPersonalInfoModal').modal('hide');
        modal_1.showYesNoModal("Discard Information", "Are you sure you want to discard filled information. Any unsaved data will be lost.", function () {
            //empty everything
            //quit modal
            $('#editPersonalInfoModal').modal('dispose');
        }, function () {
            $('#editPersonalInfoModal').modal('show');
        }, false, "Yes, discard", "No, back to Edit");
    });
}
exports.showEditPersonalInformation = showEditPersonalInformation;
function getUserImageURL(onObtainedURL, username) {
    if (!username) {
        username = getUsernameOfUser();
    }
    var storageRef = firebase.storage.ref("wpi/" + username + ".jpg");
    storageRef.getDownloadURL().then(function (url) {
        console.log(url);
        onObtainedURL(url);
    });
}
exports.getUserImageURL = getUserImageURL;
//# sourceMappingURL=credential.js.map