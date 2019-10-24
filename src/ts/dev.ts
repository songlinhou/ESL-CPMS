import { global_base_url, setServerOnline, setServerOffline } from "./ajax";

export function isDev(){
    let url = window.location.href;
    url = url.toLowerCase();
    url = url.replace('http://',"").replace('https://','');
    if((<any>url).startsWith('127.0.0.1') || (<any>url).startsWith('localhost')){
        return true;
    }
    return false;
}

export function isProd(){
    return !isDev();
}

export function reviveServer(){
    if(isDev()){
        setServerOnline();
        return; // local server always online
    }
    // to send request to server to wake it up. POOR ME
    let waiting = false;
    let trialHandler = setInterval(()=>{
        // if(waiting){
        //     return;
        // }
        try {
            waiting = true;
            $('#SafeConnectionModal').modal("show");
            $.ajax({
                url: global_base_url + "/test",
        
                method: "get",
             
                // The name of the callback parameter, as specified by the YQL service
                jsonp: 'callback',
             
                // Tell jQuery we're expecting JSONP
                dataType: "jsonp",
             
                jsonpCallback: "revive"
            }).done((resp)=>{
                setServerOnline();
                setTimeout(()=>{
                    $('#SafeConnectionModal').modal("hide");
                },100);
                
                waiting = false;
                clearInterval(trialHandler);
            }).fail((err)=>{
                waiting = false;
                setServerOffline();
                console.log("waiting for server");
                $('#SafeConnectionModal').modal("show");
            });
        } catch (error) {
            console.log("error in connect");
        };
    },500);
    
    
}