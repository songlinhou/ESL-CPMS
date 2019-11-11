import { sendJsonp } from "./ajax";
import { constructFullname } from "./utils";
import { loginInfo, populateDiscussionList } from "./app";
import { getEmailOfUser } from "./credential";

interface discussionRecord{
    discid: number,
    disctitle:string,
    authorid:string,
    discdetail:string,
    discdate:string,
    authorfirstname:string,
    authormidname:string,
    authorlastname:string,
    avatarID:string
};


export function setupDiscussionItemTriggers(){
    $('#all_discussion_list').find('.list-group-item').off('click');
    $('#all_discussion_list').find('.list-group-item').on('click',(event)=>{
        event.preventDefault();
        console.log(event.target);
        let discidStr = $(event.target).closest('a').attr('discid');
        console.log(discidStr);
        let discid:number = parseInt(discidStr);
        let imageURL = $(event.target).find('img').attr('src');
        getDicussionDetail(discid,imageURL);
    });
}

function getDicussionDetail(discid:number,imageURL:string){
    let data = {'discid':discid};
    $('#discussionDetailModal').modal('show');
    $('#discussionDetailLabel').html("Loading title...");
    $('#discussionDetailContent').html("Loading content...");
    sendJsonp('/discussion_detail',data,'post','get_discussion_detail').done((resp)=>{
        console.log(resp);
        let data:discussionRecord = resp.data[0];
        console.log(data.disctitle + " " + data.discdetail);
        let imageHTML = `<img style="cursor:pointer; width:30px;height: 30px;"   
        src="${imageURL}" class="mr-3 avatar-icon avatar-icon-update" alt="...">`;
        let fullName = constructFullname(data.authorfirstname,data.authormidname,data.authorlastname);
        let addtionalInfo = `<p style="margin-bottom: 0px;height: 20px;"><small class="text-muted" style="
        margin-left: 0px;font-size:12.8px;">by <span style="strong">${fullName}</span> at <span style="strong">${data.discdate}</span></small></p>`;
        let titleArea = `${imageHTML} ${data.disctitle} ${addtionalInfo}`;
        $('#discussionDetailLabel').html(titleArea);
        $('#discussionDetailContent').html(data.discdetail);
    });
}



export function setupDiscussionPageTriggers(){
    function getCurrentPageNum(){
        let pageNum = $('#discussion_allposts_pagination').find('.page-item.active').find('.page-link').html();
        return parseInt(pageNum);
    }
    $('#discussion_allposts_pagination').find('.page-link').off("click");
    $('#discussion_allposts_pagination').find('.page-link').on("click",(event)=>{
        event.preventDefault();
        console.log("click discuss page link");
        let text = $(event.target).html().trim();
        let pageItem = $(event.target).closest('.page-item');
        let currentPage = 1;
        let pageCount = parseInt($('#discussion_allposts_pagination').attr("pageCount"));
        if(pageItem.hasClass('disabled')){
            return;
        }
        if(pageItem.hasClass('active')){
            currentPage = parseInt(text);
            return;
        }
        if(text == 'Previous'){
            let pageNow = getCurrentPageNum();
            if(pageNow == 1){
                return;
            }
            // go to prev page
            populateDiscussionList(pageNow-1-1);
            return;
        }
        else if(text == 'Next'){
            let pageNow = getCurrentPageNum();
            if(pageNow == pageCount){
                return;
            }
            // go to next page
            populateDiscussionList(pageNow-1+1);
            return;
        }
        let pageToGo = parseInt(text);
        populateDiscussionList(pageToGo-1);
    });
}

export function setupNewDiscussionModal(){
    $('#newPostBtn').off('click');
    $('#newPostBtn').on('click',(event)=>{
        event.preventDefault();
        if(!loginInfo){
            $('#login_panel>button').click();
            $('#login_first_error').show();
            return;
        }
        $('#disTopicError').hide();
        $('#disContentError').hide();
        $('#newDiscussionModal').modal('show');
        let date = new Date();
        let dateStr = date.toDateString();
        $('#newDiscussionAddInfo').html(dateStr);
        if ($('.jqte').length == 0){
            (<any>($('#textAreaNewDiscussion'))).jqte({"status":true});
        }
    });
    // http://127.0.0.1:8888/discussion/new?email=stu2@wpi.edu&discdetail=demo%20detail&disctitle=demo%20title
    $('#newDiscussionSubmit').off('click');
    $('#newDiscussionSubmit').on('click',(event)=>{
        event.preventDefault();
        $('#disTopicError').hide();
        $('#disContentError').hide();
        if(!loginInfo){
            $('#login_panel>button').click();
            $('#login_first_error').show();
            return;
        }
        let topic = $('#discussionTopicInput').val().toString().trim();
        let content = $('#textAreaNewDiscussion').val().toString().trim();
        if(topic == ''){
            $('#disTopicError').show();
            $('#discussionTopicInput').focus();
            return;
        }
        if(content == ''){
            $('#disContentError').show();
            $('#textAreaNewDiscussion').focus();
            return;
        }
        let data = {email:getEmailOfUser(),discdetail:content,disctitle:topic};
        sendJsonp('/discussion/new',data,"post","new_discussion").done((resp)=>{
            if(resp.success){
                console.log("insert successful");
                $('#discussionTopicInput').val("");
                $('#textAreaNewDiscussion').val("");
                $('#newDiscussionModal').modal('hide');
                populateDiscussionList();
                return;
            }
            console.log("error in insert discussion",resp.message);
        });

    });
}