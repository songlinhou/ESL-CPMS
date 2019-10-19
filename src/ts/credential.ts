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

export function getFirstNameOfUser(){
    if(loginInfo.role == 'STUDENT'){
        return (<studentInfo>loginInfo).stufirstname;
    }
    else if(loginInfo.role == 'PARTNER'){
        return (<partnerInfo>loginInfo).cpfirstname;
    }
    else if(loginInfo.role == 'ADMIN'){
        return (<adminInfo>loginInfo).adminfirstname;
    }
    return null;
}

export function showEditPersonalInformation(loginInfo:any,openByUser=false){
    //check if all the fields are filled
    if (!loginInfo){
        loginInfo = JSON.parse(localStorage.getItem('login'));
    }
    if(!openByUser){
        let showEditModal = false;
        $('#personal_info_edit_error').html("");
        $.each(loginInfo,(field,value)=>{
            if(!value){
                showEditModal = true;
            }
        })
        if(!showEditModal){
            return;
        }
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
    fillPersonalInfo();
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

function fillPersonalInfo(){
    let role = loginInfo.role;
    if(role == 'STUDENT'){
        let info = <studentInfo>loginInfo;
        $('#studentFirstNameInput').val(info.stufirstname);
        $('#studentMiddleNameInput').val(info.stumidname);
        $('#studentLastNameInput').val(info.stulastname);
        $('#majorInput').val(info.major);
        $('#country_select').val(info.country);
        // let visible = $('#info_visible_select').val();
    }
    else if(role == 'PARTNER'){
        let info = <partnerInfo>loginInfo;
        $('#studentFirstNameInput').val(info.cpfirstname);
        $('#studentMiddleNameInput').val(info.cpmidname);
        $('#studentLastNameInput').val(info.cplastname);
        $('#majorInput').val(info.major);
        $('#country_select').val(info.country);
    }
    else if(role == 'ADMIN'){
        let info = <adminInfo>loginInfo;
        $('#adminFirstNameInput').val(info.adminfirstname);
        $('#adminMiddleNameInput').val(info.adminmidname);
        $('#adminLastNameInput').val(info.adminlastname);
    }
    else{
        console.log("unknown role");
    }
}

export function syncLocalUserInfo(){
    if (!loginInfo){
        return;
    }
    if (!loginInfo.digest){
        return;
    }
    let data = {
        email: getEmailOfUser(),
        digest:loginInfo.digest
    }
    sendJsonp('/account/sync',data,'post','sync_account').done(resp=>{
        if(!resp.success){
            console.log('error occured in sync',resp.message);
            return;
        }
        let data = resp.data;
        if(loginInfo.role != data.role){
            console.log('role mismatch! sync stop.');
            return;
        }
        $.each(data,(key,value)=>{
            loginInfo[key] = value;
        });
        localStorage.setItem('login',loginInfo);
    }).fail(resp=>{
        console.log("server error occured in sync",resp);
    });
}