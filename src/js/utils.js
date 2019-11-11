"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function constructFullname(first, middle, last) {
    if (middle) {
        return first + " " + middle + " " + last;
    }
    return first + " " + last;
}
exports.constructFullname = constructFullname;
//# sourceMappingURL=utils.js.map