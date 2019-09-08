"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function showCoordinates() {
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
        }
        else {
            console.log("Geolocation is not supported by this browser.");
        }
    }
    function showPosition(position) {
        console.log("Latitude: " + position.coords.latitude +
            "<br>Longitude: " + position.coords.longitude);
    }
    getLocation();
}
exports.showCoordinates = showCoordinates;
//# sourceMappingURL=location.js.map