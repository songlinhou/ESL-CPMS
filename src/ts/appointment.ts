import { sendJsonp } from "./ajax";
import { constructFullname } from "./utils";

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

export function setupStudentAppointmentView(studentEmail:string){
    let data = {"email":studentEmail};
    let htmlList:Array<string> = [];
    for(let i=0;i<7;i++){
        htmlList.push("");
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
                let scheduleFinished = scheduleMap[value.scheduleid];
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
                $(`#list-reserv_${i+1}`).html(htmlList[i]);
            }
            for(let i=0;i<7;i++){
                
            }
        });
        
    });
}