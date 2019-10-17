// let global_base_url = 'https://34.66.91.169:8888';
// let global_base_url = 'https://www.esl.today'; // for production
// let global_base_url = 'http://157.245.82.60:8888'; //for development

let global_base_url = 'http://127.0.0.1:8888'; // for production

export function sendJsonp(url:string,data:any,method:string,callback:string){
    return $.ajax({
        url: global_base_url + url,

        method: method,
     
        // The name of the callback parameter, as specified by the YQL service
        jsonp: 'callback',
     
        // Tell jQuery we're expecting JSONP
        dataType: "jsonp",
     
        // Tell YQL what we want and that we want JSON
        data: data,

        jsonpCallback: callback
    });
}

export function displayServerAddr(){
    if (global_base_url == 'https://www.esl.today'){
        console.log("On Product Server");
        return;
    }
    else if(global_base_url == 'http://157.245.82.60:8888'){
        console.log("On Test Server");
        return;
    }
    console.log(`On Server ${global_base_url}`);
}

// export function sendHTTPRequest(full_url:string,data:any,method:string){
//     return $.ajax({
//         url: full_url,
//         method: method,
        
//     });
// }