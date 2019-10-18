import { sendJsonp } from "./ajax";
import { deleteLocalCredentials, loginInfo } from "./app";
import { world_countries } from "./countryList";
import { showYesNoModal } from "./modal";

declare var firebase: any;

export function loginUser(email:string,password:string,onData?:Function,onError?:Function){
    //http://127.0.0.1:8888/account/login?email=wd@wpi.edu&password=12345678&callback=login_callback
    let url = '/account/login';
    let data = {
        email: email,
        password:password
    }
    sendJsonp(url,data,'post','login').done((resp=>{
        if(!resp.success){
            console.log(resp.message);
        }

        onData(resp);
    })).fail(resp=>{
        onError(resp);
    });
}

export function logoutUser(){
    deleteLocalCredentials();
    $('#login_panel').removeClass('d-none');
    $('#user_panel').addClass('d-none');

}

function generateCountryListHTML(){
    let countries = world_countries['countries'];
    let html = "";
    
    $.each(countries,(index,countryItem:any)=>{
        let country = countryItem['country'];
        // console.log(countryItem,index);
        let option = `<option>${country}</option>`;
        html += option;
    });
    return html;
}

export function getEmailOfUser():string{
    let email = null;

    if(loginInfo.role == 'STUDENT'){
        email = loginInfo.stuid;
    }
    else if(loginInfo.role == 'PARTNER'){
        email = loginInfo.cpid;
    }
    else if(loginInfo.role == 'ADMIN'){
        email = loginInfo.adminid;
    }
    return email;
}

export function getUsernameOfUser(){
    let email = getEmailOfUser();
    let name = email.split('@')[0];
    return name.trim();
}

export function showEditPersonalInformation(loginInfo:any){
    //check if all the fields are filled
    let showEditModal = false;
    $.each(loginInfo,(field,value)=>{
        if(!value){
            showEditModal = true;
        }
    })
    if(!showEditModal){
        return;
    }
    let email = "unknown";

    if(loginInfo.role == 'STUDENT'){
        email = loginInfo.stuid;
        $('#adminInfoForm').addClass('d-none');
        $('#studentAndPartnerInfoForm').removeClass('d-none');
    }
    else if(loginInfo.role == 'PARTNER'){
        email = loginInfo.cpid;
        $('#adminInfoForm').addClass('d-none');
        $('#studentAndPartnerInfoForm').removeClass('d-none');
    }
    else if(loginInfo.role == 'ADMIN'){
        email = loginInfo.adminid;
        $('#adminInfoForm').removeClass('d-none');
        $('#studentAndPartnerInfoForm').addClass('d-none');
    }
    $('#userEmailAddressReadonly').attr('placeholder',email);
    $('#adminEmailAddressReadonly').attr('placeholder',email);
    

    $('#country_select').html(generateCountryListHTML());
    $('#editPersonalInfoModal').modal('show');
    $('#editPersonalInfoDiscard').on('click',()=>{
        $('#editPersonalInfoModal').modal('hide');
        showYesNoModal("Discard Information","Are you sure you want to discard filled information. Any unsaved data will be lost.",
        ()=>{
            //empty everything

            //quit modal
            $('#editPersonalInfoModal').modal('dispose');
        },
        ()=>{
            $('#editPersonalInfoModal').modal('show');
        },
        false,"Yes, discard","No, back to Edit"
        );

    });
}

export function getUserImageURL(onObtainedURL:Function,username?:string){
    if(!username){
        username = getUsernameOfUser();   
    }
    let storageRef = firebase.storage.ref(`wpi/${username}.jpg`);
    storageRef.getDownloadURL().then(function(url:string) {
        console.log(url);
        onObtainedURL(url);
    });
}