"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ajax_1 = require("./ajax");
var utils_1 = require("./utils");
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
function setupStudentAppointmentView(studentEmail) {
    var data = { "email": studentEmail };
    var htmlList = [];
    for (var i = 0; i < 7; i++) {
        htmlList.push("");
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
                var scheduleFinished = scheduleMap[value.scheduleid];
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
                $("#list-reserv_" + (i + 1)).html(htmlList[i]);
            }
        });
    });
}
exports.setupStudentAppointmentView = setupStudentAppointmentView;
//# sourceMappingURL=appointment.js.map