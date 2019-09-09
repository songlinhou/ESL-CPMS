"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function verifyConversationCode() {
    $('#changeJoinMethodBtn').html("QR Code");
    $("#scannerContent").hide();
    $("#inputCodeContent").fadeIn("slow");
    window.scanner.stop();
}
exports.verifyConversationCode = verifyConversationCode;
//# sourceMappingURL=codeVerify.js.map