"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ajax_1 = require("./ajax");
var utils_1 = require("./utils");
function setupAnnouncementItemTriggers() {
    $('#anouncement_list').find('.ann_item').off('click');
    $('#anouncement_list').find('.ann_item').on('click', function (event) {
        event.preventDefault();
        $('#announcementDetailModal').modal('show');
        $('#announcementDetailLabel').html('loading title ...');
        $('#announcementDetailContent').html('loading ...');
        var annid = parseInt($(event.target).closest('a').attr('annid'));
        var data = { 'annid': annid };
        ajax_1.sendJsonp('/announcement_detail', data, 'post', 'ann_detail').done(function (resp) {
            if (!resp.success) {
                console.log("error!", resp.message);
                return;
            }
            var record = resp.data[0];
            var fullName = utils_1.constructFullname(record.adminfirstname, record.adminmidname, record.adminlastname);
            var addtionalInfo = "by " + fullName + " at " + record.anndate;
            var detail = record.anndetail;
            var email = record.adminid;
            var title = record.anntitle;
            $('#announcementTitle').html(title);
            $('#announcementDetailContent').html(detail);
            $('#announcementAddtionalInfo').html(addtionalInfo);
            $('#announcementDetailModal').attr('email', email);
        });
    });
}
exports.setupAnnouncementItemTriggers = setupAnnouncementItemTriggers;
//# sourceMappingURL=annoucement.js.map