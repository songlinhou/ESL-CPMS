import { sendJsonp } from "./ajax";
import { constructFullname } from "./utils";
declare var Sortable:any;

interface IRelationshipItem {
    rid:number,
    stuid:string,
    cpid:string,
    rstatus:number,
    stufirstname:string,
    stumidname:string,
    stulastname:string,
    cpfirstname:string,
    cpmidname:string,
    cplastname:string,
    stumajor:string,
    stucountry:string,
    cpmajor:string,
    cpcountry:string
};

console.log('console enter');

function get_partner_list(){
    function generate_popover(title:string,content:any,value:any){
        return `<a tabindex="0" style="text-decoration: none;color:black;" data-placement="bottom" role="button" data-toggle="popover" title="${title}" data-trigger="hover" data-content="${content}">${value}</a>`;
    }

    function generate_row_html(id:number,name_parts:string[],numOfStudents:number,meetNum:number,totalHour:number,avgRate:number){
        let full_name = "";
        if (name_parts[1]){
            full_name = name_parts[0] + " " + name_parts[1] + " " + name_parts[2];
        }
        else{
            full_name = name_parts[0] + " " + name_parts[2];
        }
        return `<tr>
        <td>${generate_popover("Rec No."+id,"" + id,id)}</td>
        <td>${generate_popover("Full Name=" + full_name, full_name ,name_parts[0])}</td>
        <td>${generate_popover("Number of Students=" + numOfStudents,numOfStudents,numOfStudents)}</td>
        <td>${generate_popover("Number of Meetings Anticipated="+meetNum,meetNum,meetNum)}</td>
        <td>${generate_popover("Number of Overall Meeting Hours="+totalHour,totalHour,totalHour)}</td>
        <td>${generate_popover("Average Rate from Students="+avgRate,avgRate,avgRate)}</td>
      </tr>`;
    }
    sendJsonp('/partner_view',null,"post","get_partner_list").done((resp)=>{
        console.log(resp.data);
        let html = "";
        $.each(resp.data,(index:number,record)=>{
            let fullname = [];
            fullname.push(record.cpfirstname);
            fullname.push(record.cpmidname);
            fullname.push(record.cplastname);
            html += generate_row_html(index+1,fullname,record.NumOfStudents,record.MeetingNum,record.TotalHours,record.AvgRate);
        });
        $('#partner_list_tbody').html(html);
    });
}

function get_student_list(){
    function generate_popover(title:string,content:any,value:any){
        return `<a tabindex="0" style="text-decoration: none;color:black;" data-placement="bottom" role="button" data-toggle="popover" title="${title}" data-trigger="hover" data-content="${content}">${value}</a>`;
    }
    function generate_row_html(id:number,studentName:string[],partnerName:string[],meetNum:number,totalHours:number){
        let student_full_name = "";
        let partner_full_name = "";
        if (studentName[1]){
            student_full_name = studentName[0] + " " + studentName[1] + " " + studentName[2];
        }
        else{
            student_full_name = studentName[0] + " " + studentName[2];
        }
        if(partnerName[1]){
            partner_full_name = partnerName[0] + " " + partnerName[1] + " " + partnerName[2];
        }
        else{
            partner_full_name = partnerName[0] + " " + partnerName[2];
        }

        return `<tr>
        <td>${generate_popover("Rec No."+id,"" + id,id)}</td>
        <td>${generate_popover("Student Fullname="+student_full_name,"" + student_full_name,studentName[0])}</td>
        <td>${generate_popover("Partner Fullname="+partner_full_name,"" + partner_full_name,partnerName[0])}</td>
        <td>${generate_popover("Number of Meetings Anticipated="+meetNum,meetNum,meetNum)}</td>
        <td>${generate_popover("Number of Overall Meeting Hours="+totalHours,totalHours,totalHours)}</td>
      </tr>`;
    }
    sendJsonp('/student_view',null,'post','student_view').done((resp)=>{
        if(!resp.success){
            console.log(resp.message);
            return;
        }
        let html = "";
        $.each(resp.data,(index:number,record:any)=>{
            let studentName:string[] = [];
            studentName.push(record.stufirstname);
            studentName.push(record.stumidname);
            studentName.push(record.stulastname);
            let partnerName:string[] = [];
            partnerName.push(record.cpfirstname);
            partnerName.push(record.cpmidname);
            partnerName.push(record.cplastname);
            html += generate_row_html(index+1,studentName,partnerName,record.MeetingNum,record.TotalHours)
        });
        $('#student_list_tbody').html(html);
    });
    
}

function getAssignmentList(onObtained:Function,latest:boolean = true){
    let data = {'latest':'yes'};
    if(!latest){
        data['latest'] = 'no';
    }
    sendJsonp('/stu_and_cp_assignment',data,'post','getRecentAssignmentList').done((resp)=>{
        onObtained(resp.data);
    });
}

function setupAssignmentInitialValues(){
    getAssignmentList((data_list:IRelationshipItem[])=>{
        $.each(data_list,(index:number,item)=>{
            let studentFullname = constructFullname(item.stufirstname,item.stumidname,item.stulastname);
            let partnerFullname = constructFullname(item.cpfirstname,item.cpmidname,item.cplastname);
            let studentEmail = item.stuid;
            let partnerEmail = item.cpid;
            // let 
            // TODO
        })
    },true);
}

function setupSortableList(numberOfDragableLists:number){
    function assignmentAction(from:any,to:any,target:any){
        let ulID = $(from).attr('id');
        let studentName = $(target).attr("studentName");
        let email = $(target).attr("email");
        console.log("operate on student " + studentName + " with email=" + email);
        if (ulID == "unassigned_student_drag_list"){
            let partnerName = $(to).closest('.card').attr("partner_name");
            let PartnerEmail = $(to).closest('.card').attr("partner_email");
            let args = {
                'email1':email,
                'email2':PartnerEmail
            };
            sendJsonp("/relationship/assign_new_relationship_andupdate",args,'post','relationshipupdate').done((resp)=>{
                console.log(args);
                console.log("DB changed");
            });
            console.log("assign a new student to " + partnerName);
        }
        else{
            let partnerName = $(from).closest('.card').attr("partner_name");
            let partnerEmail = $(from).closest('.card').attr("partner_email");
            let newPartnerName = $(to).closest('.card').attr("partner_name");
            let newPartnerEmail = $(to).closest('.card').attr("partner_email");
            let args = {
                'email1':email,
                'email2':newPartnerEmail
            };
            sendJsonp("/relationship/assign_new_relationship_andupdate",args,'post','relationshipupdate').done((resp)=>{
                console.log(args);
                console.log("DB changed");
            });
            console.log("unlink with former partner " + partnerName + " email="+partnerEmail);
            console.log("link with new partner " + newPartnerName + " email=" + newPartnerEmail);
        }
    }


    Sortable.create($('#unassigned_student_drag_list')[0],{
        group: {
          name: 'unassigned_student_drag_list',
          put: true,
          pull: true
        },
        animation: 100,
        onAdd: (event:Event)=>{
            console.log(event);
        }
      });

    for(let i=0;i<numberOfDragableLists;i++){
        Sortable.create($('#cont'+(i))[0],{
            group: {
              name: 'cont'+(i),
              put: true,
              pull: true
            },
            animation: 100,
            onAdd: (event:any)=>{
                console.log(event,event.to,event.from);
                assignmentAction(event.from,event.to,event.item);
            }
          });
    }

    // Sortable.create($('#cont1')[0],{
    //     group: {
    //       name: 'cont1',
    //       put: true,
    //       pull: true
    //     },
    //     animation: 100,
    //     onAdd: (event:any)=>{
    //         console.log(event,event.to,event.from);
    //         assignmentAction(event.from,event.to,event.item);
    //     }
    //   });
    
    // Sortable.create($('#cont2')[0],{
    // group: {
    //     name: 'cont2',
    //     put: true,
    //     pull: true
    // },
    // animation: 100,
    // onAdd: (event:any)=>{
    //     console.log(event,event.to,event.from);
    //     assignmentAction(event.from,event.to,event.item);
    // }
    // });

    // Sortable.create($('#cont3')[0],{
    //     group: {
    //       name: 'cont3',
    //       put: true,
    //       pull: true
    //     },
    // animation: 100,
    // onAdd: (event:any)=>{
    //     console.log(event,event.to,event.from);
    //     assignmentAction(event.from,event.to,event.item);
    // }
    // });
}

function showNonEditableCalendar(){
    $('#calendar_iframe').contents().find('.add-new').remove();
    $('#calendar_iframe').contents().find('.events').css("height","300px");
    $('#calendar_iframe').contents().find('.events').css("width","280px");
    $('#calendar_iframe').contents().find('.erase').remove();
}

function demoSend(){
    console.log("demo");
    sendJsonp("/get_nullrelatipnship_student",null,'post','nullrelationship').done((resp)=>{
        if(!resp.success){
            return;
        }
        let data = resp.data;
        let html = "";
        $.each(data,(index:number,element)=>{
            let name = constructFullname(element.stufirstname,element.stumidname,element.stulastname);
            let html_ = `<li class="list-group-item assign_item" studentName="${name}" email="${element.stuid}">${element.stufirstname}</li>`;
            html += html_;
            console.log(element,element.stuid);
        });
        $("#unassigned_student_drag_list").html(html);
        console.log(resp);
    });

}
function relationshipsendstu(cpIDs: any){
    console.log(cpIDs);
    $.each(cpIDs,(cpID:string,valueDict:any)=>{
        let html = "";
        $.each(valueDict.students,(stu:number,value:any)=>{
            let html_ = `<li class="list-group-item assign_item" studentName="${value.fullname}" email="${value.stuid}">
            <img   src="images/boy.png" class="mr-3 avatar-icon avatar-icon-update avatar_li" alt="...">${value.firstName}</li>`;
            html += html_;
        });
        $(`#${valueDict.htmlid}`).html(html);
    });
    console.log('success');
}

function relationshipsend(){
    console.log("relation");
    sendJsonp("/get_all_relationship",null,'post','relationship').done((resp)=>{
        if(!resp.success){
            return;
        }
        let data = resp.data;
        let html = "";
        let cpIDs:any = {};
        let numOfPartners = 0;
        $.each(data,(index:number,element)=>{
            let cpname = constructFullname(element.cpfirstname,element.cpmidname,element.cplastname);
            let cpID = element.cpid;
            let studentInfo = {
                'stuid':element.stuid,
                'avatarID':element.stuavater,
                'fullName':constructFullname(element.stufirstname,element.stumidname,element.stulastname),
                'firstName':element.stufirstname
            };

            if((<any>Object.keys(cpIDs)).includes(cpID)){
                cpIDs[cpID]['students'].push(studentInfo);
            }
            else{
                cpIDs[cpID] = {};
                cpIDs[cpID]['name'] = cpname;
                cpIDs[cpID]['avatar'] = element.cpavatar;
                cpIDs[cpID]['htmlid'] = 'cont'+ numOfPartners;
                cpIDs[cpID]['students'] = [];
                cpIDs[cpID]['students'].push(studentInfo);
                numOfPartners++;
            }
        });
        console.log("cpIDs=",cpIDs);
        let numOfPartners1 = 1;
        $.each(cpIDs,(cpID:string,valueDict:any)=>{
            let html_ = `<div class="text-muted"><i class="fas fa-user-friends" style="padding-right:5px;"></i>Partner${numOfPartners1}</div>
            <div class="card" style="width: 100%;" partner_name="${valueDict.name}" partner_email="${cpID}">
                <div class="card-body">
                  <h5 class="card-title"><img style="cursor:pointer; width:30px;height: 30px;"   src="images/boy.png" class="mr-3 avatar-icon avatar-icon-update" alt="...">${valueDict.name}</h5>
                  <p class="card-text">
                      <ul class="list-group list-group-horizontal pointer" style="overflow-x: scroll;" id="${valueDict.htmlid}">
                        </ul>    
                  </p>
                </div>
              </div>`;
            html += html_;
            numOfPartners1++;
            console.log(cpID);
        });
        $("#available_partners").html(html);
        relationshipsendstu(cpIDs);
        setupSortableList(numOfPartners);
        console.log(resp);
    });


}

$(document).ready(()=>{
    get_partner_list();
    get_student_list();
    showNonEditableCalendar();
    demoSend();
    relationshipsend();
});
