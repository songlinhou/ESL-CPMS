export function verifyConversationCode(){
    $('#changeJoinMethodBtn').html("QR Code");
    $("#scannerContent").hide();
    $("#inputCodeContent").fadeIn("slow");
    (<any>window).scanner.stop();
}