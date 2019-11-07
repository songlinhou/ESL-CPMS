import { sendJsonp } from "./ajax";
declare var Sortable:any;

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

function setupSortableList(){
    function assignmentAction(from:any,to:any,target:any){
        let ulID = $(from).attr('id');
        let studentName = $(target).attr("studentName");
        let email = $(target).attr("email");
        console.log("operate on student " + studentName + " with email=" + email);
        if (ulID == "unassigned_student_drag_list"){
            let partnerName = $(to).closest('.card').attr("partner_name");
            console.log("assign a new student to " + partnerName);
        }
        else{
            let partnerName = $(from).closest('.card').attr("partner_name");
            let partnerEmail = $(from).closest('.card').attr("partner_email");
            let newPartnerName = $(to).closest('.card').attr("partner_name");
            let newPartnerEmail = $(to).closest('.card').attr("partner_email");
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

    Sortable.create($('#cont1')[0],{
        group: {
          name: 'cont1',
          put: true,
          pull: true
        },
        animation: 100,
        onAdd: (event:any)=>{
            console.log(event,event.to,event.from);
            assignmentAction(event.from,event.to,event.item);
        }
      });
    
    Sortable.create($('#cont2')[0],{
    group: {
        name: 'cont2',
        put: true,
        pull: true
    },
    animation: 100,
    onAdd: (event:any)=>{
        console.log(event,event.to,event.from);
        assignmentAction(event.from,event.to,event.item);
    }
    });

    Sortable.create($('#cont3')[0],{
        group: {
          name: 'cont3',
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

$(document).ready(()=>{
    get_partner_list();
    get_student_list();
    setupSortableList();
});