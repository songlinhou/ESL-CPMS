"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ajax_1 = require("./ajax");
var utils_1 = require("./utils");
var app_1 = require("./app");
function generateAppointmentItem(date, finished, topic, name, isStudent, venue, time) {
    var finish_ = "Missing";
    var nameIdentifier = "Partner";
    if (finished) {
        finish_ = "Finished";
    }
    if (isStudent) {
        nameIdentifier = "Student";
    }
    var html = "<li class=\"media\">\n    <div class=\"fas fa-calendar-week mr-3\"></div>\n    <div class=\"media-body\">\n      <h5 class=\"mt-0 mb-1\">" + date + "</h5><span style=\"color:green\">" + finish_ + "</span>\n      <p><div class=\"fas fa-comments\" style=\"margin-left:5px;\"></div> <span>Topic</span></p>\n      <p class=\"text-muted\">" + topic + "</p>\n      <p><div class=\"fas fa-user\" style=\"margin-left:5px;\"></div> <span>" + nameIdentifier + "</span></p>\n      <p class=\"text-muted\">" + name + "</p>\n      <p><div class=\"fas fa-map-marker-alt\" style=\"margin-left:5px;\"></div> <span>Venue</span></p>\n      <p class=\"text-muted\">" + venue + "</p>\n      <p><div class=\"fas fa-stopwatch\" style=\"margin-left:5px;\"></div> <span>Time</span></p>\n      <p class=\"text-muted\">" + time + "</p>\n    </div>\n  </li>";
    return html;
}
function setupPartnerAppointmentView(partnerEmail) {
    var data = { "email": partnerEmail };
    var htmlList = [];
    for (var i = 0; i < 7; i++) {
        if (htmlList[i]) {
            $("#reserv_" + (i + 1)).css("font-weight", "normal");
        }
        else {
            $("#reserv_" + (i + 1)).css("color", "black");
        }
    }
    ajax_1.sendJsonp('/schedule/partner_view_schedule', data, "get", "partnerViewSchedule").done(function (resp) {
        if (!resp.success) {
            return;
        }
        ajax_1.sendJsonp('/sheduleFinished', null, "post", "scheduleFinished").done(function (scheduleIDData) {
            var scheduleMap = {};
            $.each(scheduleIDData, function (index, dict) {
                var finished = false;
                if (dict['MeetingFinish'] == "Yes") {
                    finished = true;
                }
                scheduleMap[dict['scheduleid']] = finished;
            });
            console.log("setupPartnerAppointmentView data=", resp);
            $.each(resp.data, function (index, value) {
                console.log("stu_view_item=", value);
                var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "Septemter", "October", "November", "December"];
                var finished = scheduleMap[value.scheduleid];
                var mtstarttime = new Date(value.mtstarttime);
                // let mtendtime = new Date(value.mtendtime);
                var monthLiteral = monthNames[mtstarttime.getMonth()];
                var date = mtstarttime.getDate();
                var day = mtstarttime.getDay(); // 0 - 6
                var topic = value.note;
                var isStudent = true;
                var venue = value.location;
                var timeStart = value.mtstarttime.split(" ")[1];
                var timeEnd = value.mtendtime.split(" ")[1];
                console.log(value.mtstarttime, monthLiteral, date, day);
                var dateFormated = monthLiteral + " " + date;
                var timeFormated = timeStart + " - " + timeEnd;
                var studentName = utils_1.constructFullname(value.stufirstname, value.stumidname, value.stulastname);
                var html_ = generateAppointmentItem(dateFormated, finished, topic, studentName, isStudent, venue, timeFormated);
                htmlList[day] += html_;
            });
            for (var i = 0; i < 7; i++) {
                if (htmlList[i]) {
                    $("#list-reserv_" + (i + 1)).html(htmlList[i]);
                }
                else {
                    $("#list-reserv_" + (i + 1)).html("Nothing is planned.");
                }
            }
            for (var i = 0; i < 7; i++) {
                if (htmlList[i]) {
                    $("#reserv_" + (i + 1)).css("font-weight", "bold");
                }
                else {
                    $("#reserv_" + (i + 1)).css("color", "gray");
                }
            }
        });
    });
}
exports.setupPartnerAppointmentView = setupPartnerAppointmentView;
function setupStudentAppointmentView(studentEmail) {
    var data = { "email": studentEmail };
    var htmlList = [];
    for (var i = 0; i < 7; i++) {
        htmlList.push("");
    }
    for (var i = 0; i < 7; i++) {
        if (htmlList[i]) {
            $("#reserv_" + (i + 1)).css("font-weight", "normal");
        }
        else {
            $("#reserv_" + (i + 1)).css("color", "black");
        }
    }
    ajax_1.sendJsonp('/schedule/stu_view_schedule', data, "get", "studentViewSchedule").done(function (resp) {
        if (!resp.success) {
            return;
        }
        var html = "";
        ajax_1.sendJsonp('/sheduleFinished', null, "post", "scheduleFinished").done(function (scheduleIDData) {
            var scheduleMap = {};
            $.each(scheduleIDData, function (index, dict) {
                var finished = false;
                if (dict['MeetingFinish'] == "Yes") {
                    finished = true;
                }
                scheduleMap[dict['scheduleid']] = finished;
            });
            $.each(resp.data, function (index, value) {
                console.log("stu_view_item=", value);
                var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "Septemter", "October", "November", "December"];
                var finished = scheduleMap[value.scheduleid];
                var mtstarttime = new Date(value.mtstarttime);
                // let mtendtime = new Date(value.mtendtime);
                var monthLiteral = monthNames[mtstarttime.getMonth()];
                var date = mtstarttime.getDate();
                var day = mtstarttime.getDay(); // 0 - 6
                var topic = value.note;
                var isStudent = false;
                var venue = value.location;
                var timeStart = value.mtstarttime.split(" ")[1];
                var timeEnd = value.mtendtime.split(" ")[1];
                console.log(value.mtstarttime, monthLiteral, date, day);
                var dateFormated = monthLiteral + " " + date;
                var timeFormated = timeStart + " - " + timeEnd;
                var cpName = utils_1.constructFullname(value.cpfirstname, value.cpmidname, value.cplastname);
                // let partnerName = constructFullname(value)
                var html_ = generateAppointmentItem(dateFormated, finished, topic, cpName, isStudent, venue, timeFormated);
                htmlList[day] += html_;
            });
            for (var i = 0; i < 7; i++) {
                if (htmlList[i]) {
                    $("#list-reserv_" + (i + 1)).html(htmlList[i]);
                }
                else {
                    $("#list-reserv_" + (i + 1)).html("Nothing is planned.");
                }
            }
            for (var i = 0; i < 7; i++) {
                if (htmlList[i]) {
                    $("#reserv_" + (i + 1)).css("font-weight", "bold");
                }
                else {
                    $("#reserv_" + (i + 1)).css("color", "gray");
                }
            }
        });
    });
}
exports.setupStudentAppointmentView = setupStudentAppointmentView;
function showStartChatModal(personName, personEmail) {
    $('#conversatonResultModal').modal("show");
    if (app_1.loginInfo.role == "STUDENT") {
        var name_1 = utils_1.constructFullname(app_1.loginInfo.stufirstname, app_1.loginInfo.stumidname, app_1.loginInfo.stulastname);
        $('#name1InChat').html(name_1);
        $('#email1InChat').html(app_1.loginInfo.stuid);
    }
    else if (app_1.loginInfo.role == "PARTNER") {
        var name_2 = utils_1.constructFullname(app_1.loginInfo.cpfirstname, app_1.loginInfo.cpmidname, app_1.loginInfo.cplastname);
        $('#name1InChat').html(name_2);
        $('#email1InChat').html(app_1.loginInfo.cpid);
    }
    else if (app_1.loginInfo.role == "ADMIN") {
        var name_3 = utils_1.constructFullname(app_1.loginInfo.adminfirstname, app_1.loginInfo.adminmidname, app_1.loginInfo.adminlastname);
        $('#name1InChat').html(name_3);
        $('#email1InChat').html(app_1.loginInfo.adminid);
    }
    $('#name2InChat').html(personName);
    $('#email2InChat').html(personEmail);
}
exports.showStartChatModal = showStartChatModal;
//# sourceMappingURL=appointment.js.map