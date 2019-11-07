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
function getFirstNameOfUser() {
    if (app_1.loginInfo.role == 'STUDENT') {
        return app_1.loginInfo.stufirstname;
    }
    else if (app_1.loginInfo.role == 'PARTNER') {
        return app_1.loginInfo.cpfirstname;
    }
    else if (app_1.loginInfo.role == 'ADMIN') {
        return app_1.loginInfo.adminfirstname;
    }
    return null;
}
exports.getFirstNameOfUser = getFirstNameOfUser;
function showEditPersonalInformation(loginInfo, openByUser) {
    if (openByUser === void 0) { openByUser = false; }
    //check if all the fields are filled
    $('#personal_info_edit_error').hide();
    if (!loginInfo) {
        loginInfo = JSON.parse(localStorage.getItem('login'));
    }
    if (!openByUser) {
        var showEditModal_1 = false;
        $('#personal_info_edit_error').html("");
        $.each(loginInfo, function (field, value) {
            if (!value) {
                showEditModal_1 = true;
            }
        });
        if (!showEditModal_1) {
            return;
        }
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
    fillPersonalInfo();
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
    var storage = firebase.storage();
    var storageRef = storage.ref("wpi/" + username + ".jpg");
    storageRef.getDownloadURL().then(function (url) {
        console.log(url);
        onObtainedURL(url);
    });
}
exports.getUserImageURL = getUserImageURL;
function fillPersonalInfo() {
    var role = app_1.loginInfo.role;
    if (role == 'STUDENT') {
        var info = app_1.loginInfo;
        $('#studentFirstNameInput').val(info.stufirstname);
        $('#studentMiddleNameInput').val(info.stumidname);
        $('#studentLastNameInput').val(info.stulastname);
        $('#majorInput').val(info.major);
        $('#country_select').val(info.country);
        // let visible = $('#info_visible_select').val();
    }
    else if (role == 'PARTNER') {
        var info = app_1.loginInfo;
        $('#studentFirstNameInput').val(info.cpfirstname);
        $('#studentMiddleNameInput').val(info.cpmidname);
        $('#studentLastNameInput').val(info.cplastname);
        $('#majorInput').val(info.major);
        $('#country_select').val(info.country);
    }
    else if (role == 'ADMIN') {
        var info = app_1.loginInfo;
        $('#adminFirstNameInput').val(info.adminfirstname);
        $('#adminMiddleNameInput').val(info.adminmidname);
        $('#adminLastNameInput').val(info.adminlastname);
    }
    else {
        console.log("unknown role");
    }
}
function syncLocalUserInfo() {
    if (!app_1.loginInfo) {
        return;
    }
    if (!app_1.loginInfo.digest) {
        return;
    }
    var data = {
        email: getEmailOfUser(),
        digest: app_1.loginInfo.digest
    };
    ajax_1.sendJsonp('/account/sync', data, 'post', 'sync_account').done(function (resp) {
        if (!resp.success) {
            console.log('error occured in sync', resp.message);
            return;
        }
        var data = resp.data;
        if (app_1.loginInfo.role != data.role) {
            console.log('role mismatch! sync stop.');
            return;
        }
        $.each(data, function (key, value) {
            app_1.loginInfo[key] = value;
        });
        localStorage.setItem('login', app_1.loginInfo);
    }).fail(function (resp) {
        console.log("server error occured in sync", resp);
    });
}
exports.syncLocalUserInfo = syncLocalUserInfo;
//# sourceMappingURL=credential.js.map