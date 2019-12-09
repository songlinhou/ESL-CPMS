import { sendJsonp } from "./ajax";
import { constructFullname } from "./utils";
import { loginInfo } from "./app";

function generateAppointmentItem(date:string,finished:boolean,topic:string,name:string,isStudent:boolean,venue:string,time:string){
    let finish_ = "Missing";
    let nameIdentifier = "Partner";
    if(finished){
        finish_ = "Finished";
    }
    if(isStudent){
        nameIdentifier = "Student";
    }
    let html = `<li class="media">
    <div class="fas fa-calendar-week mr-3"></div>
    <div class="media-body">
      <h5 class="mt-0 mb-1">${date}</h5><span style="color:green">${finish_}</span>
      <p><div class="fas fa-comments" style="margin-left:5px;"></div> <span>Topic</span></p>
      <p class="text-muted">${topic}</p>
      <p><div class="fas fa-user" style="margin-left:5px;"></div> <span>${nameIdentifier}</span></p>
      <p class="text-muted">${name}</p>
      <p><div class="fas fa-map-marker-alt" style="margin-left:5px;"></div> <span>Venue</span></p>
      <p class="text-muted">${venue}</p>
      <p><div class="fas fa-stopwatch" style="margin-left:5px;"></div> <span>Time</span></p>
      <p class="text-muted">${time}</p>
    </div>
  </li>`;
    return html;
}

export function setupPartnerAppointmentView(partnerEmail:string){
    let data = {"email":partnerEmail};
    let htmlList:Array<string> = [];
    for(let i=0;i<7;i++){
        if(htmlList[i]){
            $(`#reserv_${i+1}`).css("font-weight","normal")
        }
        else{
            $(`#reserv_${i+1}`).css("color","black")
        }
    }
    sendJsonp('/schedule/partner_view_schedule',data,"get","partnerViewSchedule").done((resp)=>{
        if(!resp.success){
            return;
        }
        sendJsonp('/sheduleFinished',null,"post","scheduleFinished").done((scheduleIDData)=>{
            let scheduleMap:any = {};
            $.each(scheduleIDData,(index:number,dict:any)=>{
                let finished = false;
                if(dict['MeetingFinish'] == "Yes"){
                    finished = true;
                }
                scheduleMap[dict['scheduleid']] = finished;
            });
            console.log("setupPartnerAppointmentView data=",resp);
            $.each(resp.data,(index:number,value:any)=>{
                console.log("stu_view_item=",value);
                let monthNames = ["January","February","March","April","May","June","July","August","Septemter","October","November","December"];
                
                let finished = scheduleMap[value.scheduleid];
                let mtstarttime = new Date(value.mtstarttime);
                // let mtendtime = new Date(value.mtendtime);
                let monthLiteral = monthNames[mtstarttime.getMonth()];
                let date = mtstarttime.getDate();
                let day = mtstarttime.getDay(); // 0 - 6
                let topic = value.note;
                let isStudent = true;
                let venue = value.location;
                let timeStart = (<string>value.mtstarttime).split(" ")[1];
                let timeEnd = (<string>value.mtendtime).split(" ")[1];
                console.log(value.mtstarttime,monthLiteral,date,day);
                let dateFormated = `${monthLiteral} ${date}`;
                let timeFormated = `${timeStart} - ${timeEnd}`;
                let studentName = constructFullname(value.stufirstname,value.stumidname,value.stulastname);
                let html_ = generateAppointmentItem(dateFormated,finished,topic,studentName,isStudent,venue,timeFormated);
                htmlList[day] += html_;
            });
            for(let i=0;i<7;i++){
                if(htmlList[i]){
                    $(`#list-reserv_${i+1}`).html(htmlList[i]);
                }
                else{
                    $(`#list-reserv_${i+1}`).html("Nothing is planned.");
                }
            }
            for(let i=0;i<7;i++){
                if(htmlList[i]){
                    $(`#reserv_${i+1}`).css("font-weight","bold")
                }
                else{
                    $(`#reserv_${i+1}`).css("color","gray")
                }
            }
        });
    });
}

export function setupStudentAppointmentView(studentEmail:string){
    let data = {"email":studentEmail};
    let htmlList:Array<string> = [];
    for(let i=0;i<7;i++){
        htmlList.push("");
    }
    for(let i=0;i<7;i++){
        if(htmlList[i]){
            $(`#reserv_${i+1}`).css("font-weight","normal")
        }
        else{
            $(`#reserv_${i+1}`).css("color","black")
        }
    }
    sendJsonp('/schedule/stu_view_schedule',data,"get","studentViewSchedule").done((resp)=>{
        if(!resp.success){
            return;
        }
        let html  = "";
        sendJsonp('/sheduleFinished',null,"post","scheduleFinished").done((scheduleIDData)=>{
            let scheduleMap:any = {};
            $.each(scheduleIDData,(index:number,dict:any)=>{
                let finished = false;
                if(dict['MeetingFinish'] == "Yes"){
                    finished = true;
                }
                scheduleMap[dict['scheduleid']] = finished;
            });

            $.each(resp.data,(index:number,value:any)=>{
                console.log("stu_view_item=",value);
                let monthNames = ["January","February","March","April","May","June","July","August","Septemter","October","November","December"];
                
                let finished = scheduleMap[value.scheduleid];
                let mtstarttime = new Date(value.mtstarttime);
                // let mtendtime = new Date(value.mtendtime);
                let monthLiteral = monthNames[mtstarttime.getMonth()];
                let date = mtstarttime.getDate();
                let day = mtstarttime.getDay(); // 0 - 6
                let topic = value.note;
                let isStudent = false;
                let venue = value.location;
                let timeStart = (<string>value.mtstarttime).split(" ")[1];
                let timeEnd = (<string>value.mtendtime).split(" ")[1];
                console.log(value.mtstarttime,monthLiteral,date,day);
                let dateFormated = `${monthLiteral} ${date}`;
                let timeFormated = `${timeStart} - ${timeEnd}`;
                let cpName = constructFullname(value.cpfirstname,value.cpmidname,value.cplastname);
                // let partnerName = constructFullname(value)
                let html_ = generateAppointmentItem(dateFormated,finished,topic,cpName,isStudent,venue,timeFormated);
                htmlList[day] += html_;
            });
            for(let i=0;i<7;i++){
                if(htmlList[i]){
                    $(`#list-reserv_${i+1}`).html(htmlList[i]);
                }
                else{
                    $(`#list-reserv_${i+1}`).html("Nothing is planned.");
                }
            }
            for(let i=0;i<7;i++){
                if(htmlList[i]){
                    $(`#reserv_${i+1}`).css("font-weight","bold")
                }
                else{
                    $(`#reserv_${i+1}`).css("color","gray")
                }
            }
        });
        
    });
}

export function showStartChatModal(personName:string,personEmail:string){
    $('#conversatonResultModal').modal("show");
    if(loginInfo.role == "STUDENT"){
        let name = constructFullname(loginInfo.stufirstname,loginInfo.stumidname,loginInfo.stulastname);
        $('#name1InChat').html(name);
        $('#email1InChat').html(loginInfo.stuid);
    }
    else if(loginInfo.role == "PARTNER"){
        let name = constructFullname(loginInfo.cpfirstname,loginInfo.cpmidname,loginInfo.cplastname);
        $('#name1InChat').html(name);
        $('#email1InChat').html(loginInfo.cpid);
    }
    else if(loginInfo.role == "ADMIN"){
        let name = constructFullname(loginInfo.adminfirstname,loginInfo.adminmidname,loginInfo.adminlastname);
        $('#name1InChat').html(name);
        $('#email1InChat').html(loginInfo.adminid);
    }

    $('#name2InChat').html(personName);
    $('#email2InChat').html(personEmail);
}