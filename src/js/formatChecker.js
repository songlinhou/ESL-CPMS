"use strict";
exports.__esModule = true;
function isInputValid(username) {
    username = username.trim();
    if (username.length == 0) {
        return false;
    }
    if (username.includes(" ")) {
        return false;
    }
    return true;
}
exports.isInputValid = isInputValid;
