"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=formatChecker.js.map