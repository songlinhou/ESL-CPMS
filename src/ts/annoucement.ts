import { sendJsonp } from "./ajax";
import { constructFullname } from "./utils";

export function setupAnnouncementItemTriggers(){
    $('#anouncement_list').find('.ann_item').off('click');
    $('#anouncement_list').find('.ann_item').on('click',(event)=>{
        event.preventDefault();
        $('#announcementDetailModal').modal('show');
        $('#announcementDetailLabel').html('loading title ...');
        $('#announcementDetailContent').html('loading ...');
        let annid = parseInt($(event.target).closest('a').attr('annid'));
        let data = {'annid':annid};
        sendJsonp('/announcement_detail',data,'post','ann_detail').done((resp)=>{
            if(!resp.success){
                console.log("error!",resp.message);
                return;
            }
            let record = resp.data[0];
            let fullName = constructFullname(record.adminfirstname,record.adminmidname,record.adminlastname);
            let addtionalInfo = `by ${fullName} at ${record.anndate}`;
            let detail = record.anndetail;
            let email = record.adminid;
            let title = record.anntitle;

            $('#announcementTitle').html(title);
            $('#announcementDetailContent').html(detail);
            $('#announcementAddtionalInfo').html(addtionalInfo);
            $('#announcementDetailModal').attr('email',email);
        });
    });
    
}