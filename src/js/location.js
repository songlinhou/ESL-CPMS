"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
function processCoordinates(position_handler) {
    function getLocation() {
        try {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            }
            else {
                console.log("Geolocation is not supported by this browser.");
            }
        }
        catch (error) {
            console.log("error obtaining coordinates", error);
            showPosition();
        }
    }
    function showPosition(position) {
        if (position) {
            console.log("Latitude: " + position.coords.latitude +
                "<br>Longitude: " + position.coords.longitude);
            position_handler(position.coords.latitude, position.coords.longitude);
        }
        else {
            console.log("process with lat=long=-1");
            position_handler(-1, -1);
        }
    }
    getLocation();
}
exports.processCoordinates = processCoordinates;
//# sourceMappingURL=location.js.map