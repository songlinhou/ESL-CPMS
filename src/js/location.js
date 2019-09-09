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
//https://www.geodatasource.com/developers/javascript
//'M' is statute miles (default)                         :::
//'K' is kilometers                                      :::
//'N' is nautical miles 
function getDistanceBetween(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") {
            dist = dist * 1.609344;
        }
        if (unit == "N") {
            dist = dist * 0.8684;
        }
        return dist;
    }
}
exports.getDistanceBetween = getDistanceBetween;
//# sourceMappingURL=location.js.map