"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isUsernameValid(username) {
    username = username.trim();
    if (username.length == 0) {
        return false;
    }
    if (username.includes(" ")) {
        return false;
    }
    return true;
}
exports.isUsernameValid = isUsernameValid;
function isStringValid(input) {
    if (!input) {
        return false;
    }
    input = input.trim();
    if (!input) {
        return false;
    }
    return true;
}
exports.isStringValid = isStringValid;
//# sourceMappingURL=formatChecker.js.map