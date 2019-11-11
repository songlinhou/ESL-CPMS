"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ajax_1 = require("./ajax");
var utils_1 = require("./utils");
var app_1 = require("./app");
var credential_1 = require("./credential");
;
function setupDiscussionItemTriggers() {
    $('#all_discussion_list').find('.list-group-item').off('click');
    $('#all_discussion_list').find('.list-group-item').on('click', function (event) {
        event.preventDefault();
        console.log(event.target);
        var discidStr = $(event.target).closest('a').attr('discid');
        console.log(discidStr);
        var discid = parseInt(discidStr);
        var imageURL = $(event.target).find('img').attr('src');
        getDicussionDetail(discid, imageURL);
    });
}
exports.setupDiscussionItemTriggers = setupDiscussionItemTriggers;
function getDicussionDetail(discid, imageURL) {
    var data = { 'discid': discid };
    $('#discussionDetailModal').modal('show');
    $('#discussionDetailLabel').html("Loading title...");
    $('#discussionDetailContent').html("Loading content...");
    ajax_1.sendJsonp('/discussion_detail', data, 'post', 'get_discussion_detail').done(function (resp) {
        console.log(resp);
        var data = resp.data[0];
        console.log(data.disctitle + " " + data.discdetail);
        var imageHTML = "<img style=\"cursor:pointer; width:30px;height: 30px;\"   \n        src=\"" + imageURL + "\" class=\"mr-3 avatar-icon avatar-icon-update\" alt=\"...\">";
        var fullName = utils_1.constructFullname(data.authorfirstname, data.authormidname, data.authorlastname);
        var addtionalInfo = "<p style=\"margin-bottom: 0px;height: 20px;\"><small class=\"text-muted\" style=\"\n        margin-left: 0px;font-size:12.8px;\">by <span style=\"strong\">" + fullName + "</span> at <span style=\"strong\">" + data.discdate + "</span></small></p>";
        var titleArea = imageHTML + " " + data.disctitle + " " + addtionalInfo;
        $('#discussionDetailLabel').html(titleArea);
        $('#discussionDetailContent').html(data.discdetail);
    });
}
function setupDiscussionPageTriggers() {
    function getCurrentPageNum() {
        var pageNum = $('#discussion_allposts_pagination').find('.page-item.active').find('.page-link').html();
        return parseInt(pageNum);
    }
    $('#discussion_allposts_pagination').find('.page-link').off("click");
    $('#discussion_allposts_pagination').find('.page-link').on("click", function (event) {
        event.preventDefault();
        console.log("click discuss page link");
        var text = $(event.target).html().trim();
        var pageItem = $(event.target).closest('.page-item');
        var currentPage = 1;
        var pageCount = parseInt($('#discussion_allposts_pagination').attr("pageCount"));
        if (pageItem.hasClass('disabled')) {
            return;
        }
        if (pageItem.hasClass('active')) {
            currentPage = parseInt(text);
            return;
        }
        if (text == 'Previous') {
            var pageNow = getCurrentPageNum();
            if (pageNow == 1) {
                return;
            }
            // go to prev page
            app_1.populateDiscussionList(pageNow - 1 - 1);
            return;
        }
        else if (text == 'Next') {
            var pageNow = getCurrentPageNum();
            if (pageNow == pageCount) {
                return;
            }
            // go to next page
            app_1.populateDiscussionList(pageNow - 1 + 1);
            return;
        }
        var pageToGo = parseInt(text);
        app_1.populateDiscussionList(pageToGo - 1);
    });
}
exports.setupDiscussionPageTriggers = setupDiscussionPageTriggers;
function setupNewDiscussionModal() {
    $('#newPostBtn').off('click');
    $('#newPostBtn').on('click', function (event) {
        event.preventDefault();
        if (!app_1.loginInfo) {
            $('#login_panel>button').click();
            $('#login_first_error').show();
            return;
        }
        $('#disTopicError').hide();
        $('#disContentError').hide();
        $('#newDiscussionModal').modal('show');
        var date = new Date();
        var dateStr = date.toDateString();
        $('#newDiscussionAddInfo').html(dateStr);
        if ($('.jqte').length == 0) {
            ($('#textAreaNewDiscussion')).jqte({ "status": true });
        }
    });
    // http://127.0.0.1:8888/discussion/new?email=stu2@wpi.edu&discdetail=demo%20detail&disctitle=demo%20title
    $('#newDiscussionSubmit').off('click');
    $('#newDiscussionSubmit').on('click', function (event) {
        event.preventDefault();
        $('#disTopicError').hide();
        $('#disContentError').hide();
        if (!app_1.loginInfo) {
            $('#login_panel>button').click();
            $('#login_first_error').show();
            return;
        }
        var topic = $('#discussionTopicInput').val().toString().trim();
        var content = $('#textAreaNewDiscussion').val().toString().trim();
        if (topic == '') {
            $('#disTopicError').show();
            $('#discussionTopicInput').focus();
            return;
        }
        if (content == '') {
            $('#disContentError').show();
            $('#textAreaNewDiscussion').focus();
            return;
        }
        var data = { email: credential_1.getEmailOfUser(), discdetail: content, disctitle: topic };
        ajax_1.sendJsonp('/discussion/new', data, "post", "new_discussion").done(function (resp) {
            if (resp.success) {
                console.log("insert successful");
                $('#discussionTopicInput').val("");
                $('#textAreaNewDiscussion').val("");
                $('#newDiscussionModal').modal('hide');
                app_1.populateDiscussionList();
                return;
            }
            console.log("error in insert discussion", resp.message);
        });
    });
}
exports.setupNewDiscussionModal = setupNewDiscussionModal;
//# sourceMappingURL=discussion.js.map