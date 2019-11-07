"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ajax_1 = require("./ajax");
console.log('console enter');
function get_partner_list() {
    function generate_popover(title, content, value) {
        return "<a tabindex=\"0\" style=\"text-decoration: none;color:black;\" data-placement=\"bottom\" role=\"button\" data-toggle=\"popover\" title=\"" + title + "\" data-trigger=\"hover\" data-content=\"" + content + "\">" + value + "</a>";
    }
    function generate_row_html(id, name_parts, numOfStudents, meetNum, totalHour, avgRate) {
        var full_name = "";
        if (name_parts[1]) {
            full_name = name_parts[0] + " " + name_parts[1] + " " + name_parts[2];
        }
        else {
            full_name = name_parts[0] + " " + name_parts[2];
        }
        return "<tr>\n        <td>" + generate_popover("Rec No." + id, "" + id, id) + "</td>\n        <td>" + generate_popover("Full Name=" + full_name, full_name, name_parts[0]) + "</td>\n        <td>" + generate_popover("Number of Students=" + numOfStudents, numOfStudents, numOfStudents) + "</td>\n        <td>" + generate_popover("Number of Meetings Anticipated=" + meetNum, meetNum, meetNum) + "</td>\n        <td>" + generate_popover("Number of Overall Meeting Hours=" + totalHour, totalHour, totalHour) + "</td>\n        <td>" + generate_popover("Average Rate from Students=" + avgRate, avgRate, avgRate) + "</td>\n      </tr>";
    }
    ajax_1.sendJsonp('/partner_view', null, "post", "get_partner_list").done(function (resp) {
        console.log(resp.data);
        var html = "";
        $.each(resp.data, function (index, record) {
            var fullname = [];
            fullname.push(record.cpfirstname);
            fullname.push(record.cpmidname);
            fullname.push(record.cplastname);
            html += generate_row_html(index + 1, fullname, record.NumOfStudents, record.MeetingNum, record.TotalHours, record.AvgRate);
        });
        $('#partner_list_tbody').html(html);
    });
}
function get_student_list() {
    function generate_popover(title, content, value) {
        return "<a tabindex=\"0\" style=\"text-decoration: none;color:black;\" data-placement=\"bottom\" role=\"button\" data-toggle=\"popover\" title=\"" + title + "\" data-trigger=\"hover\" data-content=\"" + content + "\">" + value + "</a>";
    }
    function generate_row_html(id, studentName, partnerName, meetNum, totalHours) {
        var student_full_name = "";
        var partner_full_name = "";
        if (studentName[1]) {
            student_full_name = studentName[0] + " " + studentName[1] + " " + studentName[2];
        }
        else {
            student_full_name = studentName[0] + " " + studentName[2];
        }
        if (partnerName[1]) {
            partner_full_name = partnerName[0] + " " + partnerName[1] + " " + partnerName[2];
        }
        else {
            partner_full_name = partnerName[0] + " " + partnerName[2];
        }
        return "<tr>\n        <td>" + generate_popover("Rec No." + id, "" + id, id) + "</td>\n        <td>" + generate_popover("Student Fullname=" + student_full_name, "" + student_full_name, studentName[0]) + "</td>\n        <td>" + generate_popover("Partner Fullname=" + partner_full_name, "" + partner_full_name, partnerName[0]) + "</td>\n        <td>" + generate_popover("Number of Meetings Anticipated=" + meetNum, meetNum, meetNum) + "</td>\n        <td>" + generate_popover("Number of Overall Meeting Hours=" + totalHours, totalHours, totalHours) + "</td>\n      </tr>";
    }
    ajax_1.sendJsonp('/student_view', null, 'post', 'student_view').done(function (resp) {
        if (!resp.success) {
            console.log(resp.message);
            return;
        }
        var html = "";
        $.each(resp.data, function (index, record) {
            var studentName = [];
            studentName.push(record.stufirstname);
            studentName.push(record.stumidname);
            studentName.push(record.stulastname);
            var partnerName = [];
            partnerName.push(record.cpfirstname);
            partnerName.push(record.cpmidname);
            partnerName.push(record.cplastname);
            html += generate_row_html(index + 1, studentName, partnerName, record.MeetingNum, record.TotalHours);
        });
        $('#student_list_tbody').html(html);
    });
}
function setupSortableList() {
    function assignmentAction(from, to, target) {
        var ulID = $(from).attr('id');
        var studentName = $(target).attr("studentName");
        var email = $(target).attr("email");
        console.log("operate on student " + studentName + " with email=" + email);
        if (ulID == "unassigned_student_drag_list") {
            var partnerName = $(to).closest('.card').attr("partner_name");
            console.log("assign a new student to " + partnerName);
        }
        else {
            var partnerName = $(from).closest('.card').attr("partner_name");
            var partnerEmail = $(from).closest('.card').attr("partner_email");
            var newPartnerName = $(to).closest('.card').attr("partner_name");
            var newPartnerEmail = $(to).closest('.card').attr("partner_email");
            console.log("unlink with former partner " + partnerName + " email=" + partnerEmail);
            console.log("link with new partner " + newPartnerName + " email=" + newPartnerEmail);
        }
    }
    Sortable.create($('#unassigned_student_drag_list')[0], {
        group: {
            name: 'unassigned_student_drag_list',
            put: true,
            pull: true
        },
        animation: 100,
        onAdd: function (event) {
            console.log(event);
        }
    });
    Sortable.create($('#cont1')[0], {
        group: {
            name: 'cont1',
            put: true,
            pull: true
        },
        animation: 100,
        onAdd: function (event) {
            console.log(event, event.to, event.from);
            assignmentAction(event.from, event.to, event.item);
        }
    });
    Sortable.create($('#cont2')[0], {
        group: {
            name: 'cont2',
            put: true,
            pull: true
        },
        animation: 100,
        onAdd: function (event) {
            console.log(event, event.to, event.from);
            assignmentAction(event.from, event.to, event.item);
        }
    });
    Sortable.create($('#cont3')[0], {
        group: {
            name: 'cont3',
            put: true,
            pull: true
        },
        animation: 100,
        onAdd: function (event) {
            console.log(event, event.to, event.from);
            assignmentAction(event.from, event.to, event.item);
        }
    });
}
$(document).ready(function () {
    get_partner_list();
    get_student_list();
    setupSortableList();
});
//# sourceMappingURL=console.js.map