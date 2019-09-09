export interface ICoordinate{
    latitude:number,
    longitude:number
};

export function processCoordinates(position_handler:(latitude:number,longitude:number)=>void){
    function getLocation() {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                console.log("Geolocation is not supported by this browser.");
            }
        } catch (error) {
            console.log("error obtaining coordinates",error);
            showPosition();
        }
    
    }

    function showPosition(position?:any) {
        if(position){
            console.log("Latitude: " + position.coords.latitude +
            "<br>Longitude: " + position.coords.longitude);
            position_handler(position.coords.latitude,position.coords.longitude);
        }
        else{
            console.log("process with lat=long=-1");
            position_handler(-1,-1);
        }
        
        
    }
    getLocation();
}
